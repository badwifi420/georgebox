import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';

const app = express();
app.use(express.json());



app.get('/', (req, res) => {
    res.send('Welcome to the server!');
})

const server = app.listen(8000, () =>{
    console.log('Server started on port 8000');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (socket, request) => {
    const ip = request.socket.remoteAddress;
    console.log('Connection connected');

    socket.on('message', (msg) => {
        console.log({msg});

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send('Server broadcast: ' + msg);
        })
    });

    socket.on('error', (err) => {
        console.error(`Error: ${err} ip: ${ip}`);
    })

    socket.on('close', () => {
        console.log('Connection closed');
    })
});

console.log('WebSocket server is live on ws://localhost:8000');