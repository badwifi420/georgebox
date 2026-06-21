import React from "react";
import { Box, Typography, TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {

    const navigate = useNavigate();

    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: "0 auto" }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Join or create a game</Typography>

            <TextField
                label="Join Code"
                fullWidth
                sx={{ mb: 2 }}
            />
            <Button onClick={() => navigate("/login")} fullWidth>
                click
            </Button>
        </Box>
    );
};

export default CreateRoom;