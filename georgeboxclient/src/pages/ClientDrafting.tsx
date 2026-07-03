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
    const [isDraftComplete, setIsDraftComplete] = useState(false);

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
                if (data.draftPool.length === 0) {
                    setIsDraftComplete(true);
                }
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
                    {player ? player[0].toUpperCase() : <PersonIcon />}
                </Avatar>
                <Typography variant="body2">{player || "You"}</Typography>
                {playerPicks.map((pick, i) => (
                    <Typography variant="body2" key={i} sx={{ mt: 0.5 }}>{pick}</Typography>
                ))}
            </Stack>

            <Stack sx={{ alignItems: "center", flex: 1 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>vs</Typography>
                {options.map((option, i) => (
                    <Button
                        key={i}
                        onClick={() => setSelection(option)}
                        variant={selection === option ? "contained" : "outlined"}
                        fullWidth
                        sx={{ mb: 1 }}
                        disabled={!myTurn}
                    >
                        {option}
                    </Button>
                ))}
                <Button
                    onClick={handleSend}
                    fullWidth
                    variant="contained"
                    disabled={isDraftComplete || !myTurn || !selection}
                    sx={{ mt: 1 }}
                >
                    {isDraftComplete
                        ? "Waiting for all players to finish drafting..."
                        : myTurn
                            ? "Confirm pick"
                            : "Opponent's turn..."}
                </Button>
            </Stack>

            <Stack sx={{ alignItems: "center", flex: 1 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: "error.main" }}>
                    {opponent ? opponent[0].toUpperCase() : <PersonIcon />}
                </Avatar>
                <Typography variant="body2">{opponent || "Opponent"}</Typography>
                {opponentPicks.map((pick, i) => (
                    <Typography variant="body2" key={i} sx={{ mt: 0.5 }}>{pick}</Typography>
                ))}
            </Stack>
        </Stack>
        </Stack>);
};

export default ClientDrafting;