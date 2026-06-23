import {useState} from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { useWebSocket } from "../context/WebSocketContext"

const Lobby = () => {
    const { roomId } = useWebSocket();
    const [players, setPlayers] = useState<number[]>([]);

    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: "0 auto" }}>
            <Typography variant="h4" sx={{ mb: 3 }} >{roomId ? `Room Code: ${roomId}` : "Loading..."}</Typography>
        </Box>
    );
};

export default Lobby;