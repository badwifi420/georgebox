import { createContext } from 'react';

const WebSocketContext = createContext(null);

const WebSocketProvider = ({ children }) => {
    const socketRef = useRef(null);

    const connect = (roomCode) => {
        socketRef.current = new WebSocket(`ws://localhost:8000?room=${roomCode}`)
    }
}