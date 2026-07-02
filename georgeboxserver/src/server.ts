import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import { URL } from 'url';
import promptsData from './data/prompts.json' assert { type: 'json' };
import topicsData from './data/draftTopics.json' assert { type: 'json' };


const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the server!');
})

const server = app.listen(8000, () =>{
    console.log('Server started on port 8000');
});

const wss = new WebSocketServer({ server });

const allPrompts: string[] = promptsData.prompts;
const allTopics: string[] = topicsData.draftTopics;

function getRandomPrompt(prompts: string[]): string {
    const index = Math.floor(Math.random() * prompts.length);
    return prompts[index];
}
function getRandomSubset<T>(arr: T[], fraction: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    const count = Math.max(2, Math.floor(arr.length * fraction));
    return shuffled.slice(0, count);
}

function uid(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

class Player {
    id: string;
    name: string;
    socket: WebSocket;
    selections: string[];

    constructor(name: string, socket: WebSocket) {
        this.id = uid();
        this.name = name;
        this.socket = socket;
        this.selections = [];
    }
}

class Room {
    roomCode: string;
    players: Player[];
    hostSocket: WebSocket | null;
    answerPool: string[];
    draftPool: string[];
    promptPhaseActive: boolean;
    phaseEndsAt: number | null;
    pairs: [Player, Player][];


    constructor() {
        this.roomCode = generateRoomCode();
        this.players = [];
        this.hostSocket = null;
        this.answerPool = [];
        this.promptPhaseActive = false;
        this.phaseEndsAt = null;
        this.pairs = [];
        this.draftPool = [];
    }
}

const rooms = new Map<string, Room>();

function createRoom(): string {
    const newRoom = new Room();
    rooms.set(newRoom.roomCode, newRoom);
    return newRoom.roomCode;
}

wss.on('connection', (socket, request) => {
    const { searchParams } = new URL(request.url, `http://${request.headers.host}`);
    const isHosting = searchParams.get('create') === 'true';

    if (isHosting) {
        const roomCode = createRoom();
        const room = rooms.get(roomCode)!;
        room.hostSocket = socket;

        console.log("Created room with code", roomCode);
        socket.send(JSON.stringify({ type: "joined", roomCode }));
    } else {
        const name = searchParams.get('name');
        if (!name) {
            socket.send(JSON.stringify({ type: "error", message: "Name is required" }));
            socket.close(4002, "Name is required");
            return;
        }

        const requestedCode = searchParams.get('roomCode');
        if (!requestedCode || !rooms.has(requestedCode)) {
            socket.send(JSON.stringify({ type: "error", message: "Invalid room code" }));
            socket.close(4001, "Invalid room code");
            return;
        }

        const room = rooms.get(requestedCode)!;
        const player = new Player(name, socket);
        room.players.push(player);

        socket.send(JSON.stringify({ type: "joined", roomCode: requestedCode }));

        if (room.hostSocket && room.hostSocket.readyState === WebSocket.OPEN) {
            room.hostSocket.send(JSON.stringify({
                type: "playerJoined",
                players: room.players.map(p => ({ id: p.id, name: p.name }))
            }));
        }
    }

    console.log('Connection connected');

    socket.on('message', (msg) => {
        const text = msg.toString();
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Invalid JSON received:", text);
            return;
        }

        const room = rooms.get(data.roomCode);
        if (!room) {
            console.error("Unknown room:", data.roomCode);
            return;
        }

        switch (data.type) {
            case "start":
                console.log(`Starting game for room ${data.roomCode}`);
                room.players.forEach((player) => {
                    if (player.socket && player.socket.readyState === WebSocket.OPEN) {
                        player.socket.send(JSON.stringify({ type: "gameStarted" }));
                    }
                });
                break;
            case "firstPrompt": {
                const PHASE_DURATION_MS = 30000;

                if (!room.promptPhaseActive) {
                    room.promptPhaseActive = true;
                    room.phaseEndsAt = Date.now() + PHASE_DURATION_MS;

                    setTimeout(() => {
                        room.promptPhaseActive = false;
                        room.players.forEach((p) => {
                            if (p.socket.readyState === WebSocket.OPEN) {
                                p.socket.send(JSON.stringify({ type: "promptPhaseEnd" }));
                            }
                        });
                    }, PHASE_DURATION_MS);
                }

                const prompt = getRandomPrompt(allPrompts);
                socket.send(JSON.stringify({
                    type: "prompt",
                    prompt,
                    phaseEndsAt: room.phaseEndsAt
                }));
                break;
            }
            case "answer": {
                console.log(`Answer: ${data.answer}`);
                room.answerPool.push(data.answer);
                const prompt = getRandomPrompt(allPrompts);
                socket.send(JSON.stringify({type: "prompt", prompt: prompt, phaseEndsAt: room.phaseEndsAt}))
                break;
            }
            case "draftload": {
                room.pairs = [];

                const shuffled = [...room.players].sort(() => Math.random() - 0.5);
                for (let i = 0; i < shuffled.length - 1; i += 2) {
                    room.pairs.push([shuffled[i], shuffled[i + 1]]);
                }

                const topic = getRandomPrompt(allTopics);
                const draftPool = getRandomSubset(room.answerPool, 0.5);
                room.draftPool = draftPool;

                room.pairs.forEach(([playerA, playerB]) => {
                    const payloadA = { type: "draftStart", topic, draftPool, player: playerA.name, opponent: playerB.name, turn: playerA.name};
                    const payloadB = { type: "draftStart", topic, draftPool, player: playerB.name, opponent: playerA.name, turn: playerA.name};

                    if (playerA.socket.readyState === WebSocket.OPEN) playerA.socket.send(JSON.stringify(payloadA));
                    if (playerB.socket.readyState === WebSocket.OPEN) playerB.socket.send(JSON.stringify(payloadB));
                });
                break;
            }
            case "selection": {
                const playerA = room.players.find(p => p.socket === socket);
                if (!playerA) {
                    console.error("Player not found for this socket");
                    return;
                }
                if (!room.draftPool.includes(data.selection)) {
                    console.warn(`Invalid selection: ${data.selection}`);
                    return;
                }
                const pair = room.pairs.find(([a, b]) => a.id === playerA.id || b.id === playerA.id);
                if (!pair) {
                    console.error("Player not in any pair");
                    return;
                }
                const playerB = pair[0].id === playerA.id ? pair[1] : pair[0];

                playerA.selections.push(data.selection);
                room.draftPool = room.draftPool.filter(a => a !== data.selection);


                const updateA = JSON.stringify({
                    type: "draftUpdate",
                    draftPool: room.draftPool,
                    turn: false,
                    myPicks: playerA.selections,
                    opponentPicks: playerB.selections
                });

                const updateB = JSON.stringify({
                    type: "draftUpdate",
                    draftPool: room.draftPool,
                    turn: true,
                    myPicks: playerB.selections,
                    opponentPicks: playerA.selections
                });

                if (playerA.socket.readyState === WebSocket.OPEN) playerA.socket.send(updateA);
                if (playerB.socket.readyState === WebSocket.OPEN) playerB.socket.send(updateB);

                console.log(`${playerA.name} picked "${data.selection}" — now ${playerB.name}'s turn`);
                break;
            }
            case "vote":
                console.log(`Vote received for room ${data.roomCode}:`, data.choice);
                break;

            default:
                console.warn("Unknown message type:", data.type);
        }
    });

    socket.on('error', (err) => {
        console.error(`Error: ${err}`);
    });

    socket.on('close', () => {
        console.log('Connection closed');
    });
});

console.log('WebSocket server is live on ws://192.168.178.27:8000');