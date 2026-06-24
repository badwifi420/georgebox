import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import { URL } from 'url';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the server!');
})

const server = app.listen(8000, () =>{
    console.log('Server started on port 8000');
});

const wss = new WebSocketServer({ server });

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
    answers: string[];
    socket: WebSocket;

    constructor(name: string, socket: WebSocket) {
        this.id = uid();
        this.name = name;
        this.answers = [];
        this.socket = socket;
    }
}

class Room {
    roomCode: string;
    players: Player[];
    hostSocket: WebSocket | null;

    constructor() {
        this.roomCode = generateRoomCode();
        this.players = [];
        this.hostSocket = null;
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
            case "firstPrompt":
                socket.send(JSON.stringify({type: "prompt", prompt: ""}))
                break

            case "answer":
                console.log(`Answer: ${data.answer}`);
                socket.send(JSON.stringify({type: "prompt", prompt: ""}))
                break;

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