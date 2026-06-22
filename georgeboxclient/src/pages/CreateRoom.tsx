import { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { useWebSocket } from "../context/WebSocketContext";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {

    const { socket, connect } = useWebSocket();
    const [roomCode, setRoomCode] = useState("");
    const navigate = useNavigate();

    const handleJoin = async () => {
        try {
            await connect(roomCode);
            navigate("/prompts");
        } catch (err) {
            console.error("Failed to connect:", err);
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: "0 auto" }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Join or create a game</Typography>

            <TextField
                label="Join Code"
                fullWidth
                sx={{ mb: 2 }}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
            />
            <Button onClick={handleJoin} fullWidth>
                enter code
            </Button>
        </Box>
    );
};

export default CreateRoom;