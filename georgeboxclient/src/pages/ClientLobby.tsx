import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { useWebSocket } from "../context/WebSocketContext"
import { useNavigate } from "react-router-dom";


const ClientLobby = () => {

    const { socket } = useWebSocket();

    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "gameStarted") {
                navigate("/prompts");
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
    }, [socket]);


    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: "0 auto" }}>
            <Typography variant="h3" sx={{ mb: 3 }}>You're in!</Typography>
            <Typography variant="h4" sx={{ mb: 3 }}>Waiting for host to start...</Typography>
        </Box>
    );
};

export default ClientLobby;