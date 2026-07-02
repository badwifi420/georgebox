import {useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Avatar, Stack } from "@mui/material";
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
    const [myTurn, setMyTurn] = useState(false);
    const [playerPicks, setPlayerPicks] = useState([]);
    const [opponentPicks, setOpponentPicks] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;
        socket.send(JSON.stringify({type: "draftload", roomCode: roomId}));
    }, [socket]);

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
                setMyTurn((data.turn === data.player))
            } else if (data.type === "draftUpdate") {
                console.log("draftStart received:", data);
                setOptions(data.draftPool);
                setMyTurn(data.turn);
                setPlayerPicks(data.myPicks);
                setOpponentPicks(data.opponentPicks);
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
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Stack sx={{ alignItems: "center" }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                        {player ? player[0].toUpperCase() : <PersonIcon />}
                    </Avatar>
                    <Typography variant="body2">{player || "You"}</Typography>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>{playerPicks}</Typography>
                </Stack>

                <Typography variant="h5" sx={{ alignSelf: "center" }}>vs</Typography>

                <Stack sx={{ alignItems: "center" }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: "error.main" }}>
                        {opponent ? opponent[0].toUpperCase() : <PersonIcon />}
                    </Avatar>
                    <Typography variant="body2">{opponent || "Opponent"}</Typography>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>{opponentPicks}</Typography>
                </Stack>
            </Stack>
            {options.map((option, i) => (
                <Button key={i} onClick={() => setSelection(option)} variant={selection === option ? "contained" : "outlined"} fullWidth sx={{ mb: 1 }}>
                    {option}
                </Button>
            ))}
            <Button
                onClick={handleSend}
                fullWidth
                disabled={!myTurn || !selection}
            >
                {myTurn ? "Confirm pick" : "Opponent's turn..."}
            </Button>
        </Box>
    );
};

export default ClientDrafting;