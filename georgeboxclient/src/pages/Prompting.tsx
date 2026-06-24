import {useState} from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { useWebSocket } from "../context/WebSocketContext"

const Prompting = () => {
    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: "0 auto" }}>
            <Typography variant="h3" sx={{ mb: 3 }}>Answer the prompts on your device</Typography>
        </Box>
    );
};

export default Prompting;