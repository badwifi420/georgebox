import { useContext, createContext, useState } from 'react';

const WebSocketContext = createContext(null);

const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    const connect = (roomCode) => {
        const ws = new WebSocket(`ws://localhost:8000?room=${roomCode}`)

        ws.addEventListener("open", () => {
            console.log(`Connected to ${roomCode}`);
            setSocket(ws);
        })

        ws.addEventListener("close", () => {
            setSocket(null);
        });

        ws.addEventListener("error", (err) => {
            console.error("WebSocket error:", err);
        });
    }

    const disconnect = () => {
        socket?.close();
    };

    return (
        <WebSocketContext value={{ socket, connect }}>
            {children}
        </WebSocketContext>
    );
}

const useWebSocket = () => {
    return useContext(WebSocketContext);
}

export { WebSocketProvider, useWebSocket };