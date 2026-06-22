import React from "react";
import { Box, Typography, TextField } from "@mui/material";

const Prompting = () => {

    return (
        <Box sx={{ p: 4, maxWidth: 400, margin: "0 auto" }}>
            <Typography variant="h4" sx={{ mb: 3 }}>web socket test</Typography>

            <TextField
                label="Message"
                fullWidth
                sx={{ mb: 2 }}
            />
        </Box>
    );
};

export default Prompting;