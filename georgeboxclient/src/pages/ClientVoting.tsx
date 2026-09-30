import { useState, useEffect } from "react";
import { Typography, Button, Stack, Avatar } from "@mui/material";
import { useWebSocket } from "../context/WebSocketContext";
import { useNavigate } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';

const ClientVoting = () => {
    const { socket, roomId } = useWebSocket();
    const [playerOne, setPlayerOne] = useState({ name: "", picks: [] });
    const [playerTwo, setPlayerTwo] = useState({ name: "", picks: [] });
    const [topic, setTopic] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [isMe, setIsMe] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;
        socket.send(JSON.stringify({ type: "voteLoad", roomCode: roomId }));
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "voteStart") {
                setPlayerOne(data.teamA);
                setPlayerTwo(data.teamB);
                setTopic(data.topic);
                setIsMe(data.isDrafter);
            }
        };

        socket.addEventListener("message", handleMessage);
        return () => socket.removeEventListener("message", handleMessage);
    }, [socket]);

    const handleClick = () => {
        if (!selectedPlayer || hasVoted) return;
        socket.send(JSON.stringify({ type: "vote", player: selectedPlayer, roomCode: roomId }));
        setHasVoted(true);
    };

    return (
        <Stack sx={{
            minHeight: "100vh",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
        }}>
            <Typography variant="h4" sx={{ mb: 1 }}>Who wins?</Typography>
            <Typography variant="h6" sx={{ mb: 4, color: "text.secondary" }}>{topic}</Typography>

            <Stack direction="row" sx={{ width: "90%", gap: 2, mb: 4 }}>

                {/* Team A */}
                <Stack
                    onClick={() => !isMe && !hasVoted && setSelectedPlayer(playerOne.name)}
                    sx={{
                        flex: 1,
                        minHeight: 500,
                        bgcolor: selectedPlayer === playerOne.name ? "#371E30" : "#371E3020",
                        borderColor: selectedPlayer === playerOne.name ? "#371E30" : "#371E3050",
                        "&:hover": { bgcolor: isMe || hasVoted ? undefined : "#371E3040" },
                        border: "3px solid",
                        borderRadius: 2,
                        alignItems: "center",
                        justifyContent: "flex-start",
                        pt: 4,
                        cursor: isMe || hasVoted ? "default" : "pointer",
                        transition: "all 0.2s",
                        opacity: isMe ? 0.6 : 1,
                    }}
                >
                    <Avatar sx={{ width: 72, height: 72, bgcolor: "#A03E99", mb: 2 }}>
                        {playerOne.name ? playerOne.name[0].toUpperCase() : <PersonIcon />}
                    </Avatar>
                    <Typography variant="h6" sx={{ color: "#A03E99", mb: 2 }}>
                        {playerOne.name || "Player One"}
                    </Typography>
                    {playerOne.picks.map((pick, i) => (
                        <Typography key={i} variant="body2" sx={{ color: "#A03E99", mb: 0.5 }}>
                            {pick}
                        </Typography>
                    ))}
                    {selectedPlayer === playerOne.name && (
                        <Typography variant="body2" sx={{ mt: 2, color: "#A03E99" }}>✓ Your vote</Typography>
                    )}
                </Stack>

                {/* Team B */}
                <Stack
                    onClick={() => !isMe && !hasVoted && setSelectedPlayer(playerTwo.name)}
                    sx={{
                        flex: 1,
                        minHeight: 500,
                        bgcolor: selectedPlayer === playerTwo.name ? "#A03E99" : "#A03E9920",
                        borderColor: selectedPlayer === playerTwo.name ? "#A03E99" : "#A03E9950",
                        "&:hover": { bgcolor: isMe || hasVoted ? undefined : "#A03E9940" },
                        border: "3px solid",
                        borderRadius: 2,
                        alignItems: "center",
                        justifyContent: "flex-start",
                        pt: 4,
                        cursor: isMe || hasVoted ? "default" : "pointer",
                        transition: "all 0.2s",
                        opacity: isMe ? 0.6 : 1,
                    }}
                >
                    <Avatar sx={{ width: 72, height: 72, bgcolor: "#371E30", mb: 2 }}>
                        {playerTwo.name ? playerTwo.name[0].toUpperCase() : <PersonIcon />}
                    </Avatar>
                    <Typography variant="h6" sx={{ color: "#371E30", mb: 2 }}>
                        {playerTwo.name || "Player Two"}
                    </Typography>
                    {playerTwo.picks.map((pick, i) => (
                        <Typography key={i} variant="body2" sx={{ color: "#371E30", mb: 0.5 }}>
                            {pick}
                        </Typography>
                    ))}
                    {selectedPlayer === playerTwo.name && (
                        <Typography variant="body2" sx={{ mt: 2, color: "#371E30" }}>✓ Your vote</Typography>
                    )}
                </Stack>

            </Stack>

            {!isMe && (
                <Button
                    onClick={handleClick}
                    variant="contained"
                    disabled={!selectedPlayer || hasVoted}
                    sx={{ width: 300 }}
                >
                    {hasVoted ? "Vote submitted!" : selectedPlayer ? `Vote for ${selectedPlayer}` : "Select a side"}
                </Button>
            )}

            {isMe && (
                <Typography variant="body2" color="text.secondary">
                    You're a drafter — sit tight while others vote.
                </Typography>
            )}
        </Stack>
    );
};

export default ClientVoting;