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
const hostCode = "JOIN";

wss.on('connection', (socket, request) => {
    const { searchParams } = new URL(request.url, `http://${request.headers.host}`);
    const roomCode = searchParams.get('roomCode');

    if (roomCode !== hostCode) {
        socket.send(JSON.stringify({ type: "error", message: "Invalid room code" }));
        socket.close(4001, "Invalid room code");
        return;
    }

    socket.send(JSON.stringify({ type: "joined", roomCode }));

    console.log('Connection connected');

    socket.on('message', (msg) => {
        const text = msg.toString();
        console.log({ text });
    });

    socket.on('error', (err) => {
        console.error(`Error: ${err}`);
    })

    socket.on('close', () => {
        console.log('Connection closed');
    })
});

console.log('WebSocket server is live on ws://localhost:8000');