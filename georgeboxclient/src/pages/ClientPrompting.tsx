import {useState, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { useWebSocket } from "../context/WebSocketContext"
import { useNavigate } from "react-router-dom";

const ClientPrompting = () => {

    const { socket, roomId } = useWebSocket();
    const [answer, setAnswer] = useState("");
    const [prompt, setPrompt] = useState("");
    const [phaseEndsAt, setPhaseEndsAt] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;
        socket.send(JSON.stringify({type: "firstPrompt", roomCode: roomId}));
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "prompt") {
                setPrompt(data.prompt);
                setPhaseEndsAt(data.phaseEndsAt);
            } else if (data.type === "promptPhaseEnd") {
                setPhaseEndsAt(null);
                navigate("/drafting");
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
    }, [socket]);

    useEffect(() => {
        if (!phaseEndsAt) return;

        const updateTimeLeft = () => {
            const remaining = Math.max(0, Math.round((phaseEndsAt - Date.now()) / 1000));
            setTimeLeft(remaining);
        };

        updateTimeLeft(); // run immediately, don't wait 1s for the first tick
        const interval = setInterval(updateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [phaseEndsAt]);

    const handleSend = () => {
        socket.send(JSON.stringify({type: "answer", answer, roomCode: roomId}));
        setAnswer("");
    }
    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: "0 auto" }}>
            <Typography variant="h4" sx={{ mb: 3 }}>{prompt}</Typography>
            <Typography variant="h6" color={timeLeft <= 10 ? "error" : "text.secondary"} sx={{ mb: 3 }}>
                {timeLeft}s
            </Typography>

            <TextField
                label="Message"
                value = {answer}
                fullWidth
                sx={{ mb: 2 }}
                onChange={(e) => setAnswer(e.target.value)}
            />
            <Button onClick={handleSend} fullWidth>
                enter
            </Button>
        </Box>
    );
};

export default ClientPrompting;