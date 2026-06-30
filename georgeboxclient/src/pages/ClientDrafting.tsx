import {useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Avatar } from "@mui/material";
import { useWebSocket } from "../context/WebSocketContext"
import { useNavigate } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';

const ClientDrafting = () => {

    const { socket, roomId } = useWebSocket();
    const [selection, setSelection] = useState("");
    const [topic, setTopic] = useState("");
    const [opponent, setOpponent] = useState("");
    const [player, setPlayer] = useState("");
    const [options, setOptions] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;
        socket.send(JSON.stringify({type: "draftload", roomCode: roomId}));
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "topic") {
                setTopic(data.topic);
            } else if (data.type === "draftStart") {
                setPlayer(data.player);
                setOpponent(data.opponent);
                setOptions(data.draftPool);
                setTopic(data.topic);
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
    }, [socket]);

    const handleSend = () => {
        socket.send(JSON.stringify({type: "selection", selection, roomCode: roomId}));
        setSelection("");
    }
    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: "0 auto" }}>
            <Typography variant="h4" sx={{ mb: 3 }}>{topic}</Typography>
            <Avatar
                sx={{
                    width: 56,
                    height: 56,
                    bgcolor: player ? "primary.main" : "grey.300",
                }}
            >
                {opponent ? opponent.name[0].toUpperCase() : <PersonIcon />}
            </Avatar>
            <Avatar
                sx={{
                    width: 56,
                    height: 56,
                    bgcolor: player ? "primary.main" : "grey.300",
                }}
            >
                {player ? player.name[0].toUpperCase() : <PersonIcon />}
            </Avatar>
            <Button onClick={handleSend} fullWidth>
                enter
            </Button>
        </Box>
    );
};

export default ClientDrafting;