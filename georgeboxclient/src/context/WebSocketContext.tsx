import { useContext, createContext, useState } from 'react';

const WebSocketContext = createContext(null);

const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [roomId, setRoomid] = useState(null);

    const connect = (roomCode, playerName , isCreating) => {
        return new Promise((resolve, reject) => {
            const query = isCreating
                ? `create=true&name=${encodeURIComponent(playerName)}`
                : `roomCode=${encodeURIComponent(roomCode)}&name=${encodeURIComponent(playerName)}`;
            const ws = new WebSocket(`ws://192.168.178.27:8000?${query}`);

            ws.addEventListener("open", () => {
            });

            ws.addEventListener("message", (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "joined") {
                    setSocket(ws);
                    setRoomid(data.roomCode);
                    resolve(ws);
                } else if (data.type === "error") {
                    reject(new Error(data.message));
                }
            });

            ws.addEventListener("error", (err) => {
                reject(err);
            });

            ws.addEventListener("close", (event) => {
                setSocket(null);
            });
        });
    };

    const disconnect = () => {
        socket?.close();
    };

    const sendPrompt = (prompt) => {
        socket.send(JSON.stringify({type: "prompt", prompt, roomCode: roomId}));
    }

    return (
        <WebSocketContext value={{ socket, connect, disconnect, sendPrompt, roomId}}>
            {children}
        </WebSocketContext>
    );
}

const useWebSocket = () => {
    return useContext(WebSocketContext);
}

export { WebSocketProvider, useWebSocket };