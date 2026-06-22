import {useState} from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { useWebSocket } from "../context/WebSocketContext"

const Prompting = () => {

    const { sendPrompt } = useWebSocket();
    const [prompt, setPrompt] = useState("");

    const handleSend = () => {
        sendPrompt(prompt);
        setPrompt("");
    }
    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: "0 auto" }}>
            <Typography variant="h4" sx={{ mb: 3 }}>web socket test</Typography>

            <TextField
                label="Message"
                value = {prompt}
                fullWidth
                sx={{ mb: 2 }}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <Button onClick={handleSend} fullWidth>
                enter
            </Button>
        </Box>
    );
};

export default Prompting;