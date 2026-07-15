import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Stack, Avatar } from "@mui/material";
import { useWebSocket } from "../context/WebSocketContext"
import { useNavigate } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';


const ClientVoting = () => {

    const { socket, roomId } = useWebSocket();
    const [playerTwo, setPlayerTwo] = useState("");
    const [playerOne, setPlayerOne] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [isMe , setIsMe] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;
        socket.send(JSON.stringify({ type: "votingLoad", roomCode: roomId }));
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "votingStart") {
                setPlayerOne(data.player);
                setPlayerTwo(data.opponent)
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
    }, [socket]);

    const handleClick = () => {
        socket.send(JSON.stringify({type: "vote", player:selectedPlayer, roomCode: roomId}));
    }


    return (
        <Stack sx={{
            p: 4,
            pt: 10,
            maxWidth: 700,
            width: "100%",
            margin: "0 auto",
            alignItems: "center",
        }}>
        <Stack direction="row" sx={{ width: "100%", alignItems: "flex-start", gap: 2 }}>
            <Stack sx={{ alignItems: "center", flex: 1 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                    {playerOne ? playerOne[0].toUpperCase() : <PersonIcon />}
                </Avatar>
                <Typography variant="body2">{playerOne || "player one"}</Typography>
            </Stack>
            <Stack sx={{ alignItems: "center", flex: 1 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                    {playerTwo ? playerTwo[0].toUpperCase() : <PersonIcon />}
                </Avatar>
                <Typography variant="body2">{playerTwo || "player two"}</Typography>
            </Stack>
        </Stack>
            </Stack>
    );
};

export default ClientVoting;