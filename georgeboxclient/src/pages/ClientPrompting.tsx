import {useState, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { useWebSocket } from "../context/WebSocketContext"

const ClientPrompting = () => {

    const { socket, connect } = useWebSocket();
    const [answer, setAnswer] = useState("");
    const [prompt, setPrompt] = useState("");

    const sendAnswer = (answer) => {
        socket.send(JSON.stringify({type: "answer", answer, roomCode: roomId}));
    }

    useEffect(() => {
        if (!socket) return;
        socket.send(JSON.stringify({type: "firstPrompt"}));
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "prompt") {
                setPrompt(data.prompt);
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
    }, [socket]);

    const handleSend = () => {
        sendAnswer(answer);
        setAnswer("");
    }
    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: "0 auto" }}>
            <Typography variant="h4" sx={{ mb: 3 }}>{prompt}</Typography>

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