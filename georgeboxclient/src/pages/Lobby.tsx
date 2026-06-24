import { Box, Typography, Avatar, Stack, Button } from "@mui/material";
import { useWebSocket } from "../context/WebSocketContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';

const MAX_PLAYERS = 8;

const Lobby = () => {
    const { socket, roomId } = useWebSocket();
    const [players, setPlayers] = useState([]);

    const navigate = useNavigate();

    const handleStart = () => {
        socket.send(JSON.stringify({type: "start", roomCode: roomId}));
        navigate("/hostPrompt");
    }

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "playerJoined") {
                setPlayers(data.players);
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
    }, [socket]);

    const slots = Array.from({ length: MAX_PLAYERS }, (_, i) => players[i] ?? null);

    return (
        <Box sx={{ p: 4, maxWidth: 500, margin: "0 auto" }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                {roomId ? `Room Code: ${roomId}` : "Loading..."}
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
                Players ({players.length}/{MAX_PLAYERS})
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 2,
                    mb: 3,
                }}
            >
                {slots.map((player, i) => (
                    <Stack key={player?.id ?? `empty-${i}`} spacing={1}>
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                bgcolor: player ? "primary.main" : "grey.300",
                            }}
                        >
                            {player ? player.name[0].toUpperCase() : <PersonIcon />}
                        </Avatar>
                        <Typography
                            variant="body2"
                            sx={{ color: player ? "text.primary" : "text.disabled" }}
                        >
                            {player ? player.name : "Waiting..."}
                        </Typography>
                    </Stack>
                ))}
            </Box>

            <Button onClick={handleStart} fullWidth variant="contained" disabled={players.length === 0}>
                Start Game
            </Button>
        </Box>
    );
};

export default Lobby;