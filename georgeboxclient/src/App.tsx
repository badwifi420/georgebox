import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateRoom from "./pages/CreateRoom";
import Prompting from "./pages/Prompting";
import Lobby from "./pages/Lobby";
import ClientPrompting from "./pages/ClientPrompting";
import ClientLobby from "./pages/ClientLobby";
import { WebSocketProvider} from "./context/WebSocketContext"
import './App.css';

function App() {
  return (
      <WebSocketProvider>
        <Router>
            <Routes>
                <Route path="/" element={<CreateRoom/>}/>
                <Route path="/prompts" element={<ClientPrompting/>}/>
                <Route path="/hostLobby" element={<Lobby/>}/>
                <Route path="/lobby" element={<ClientLobby/>}/>
                <Route path="/hostPrompt" element={<Prompting/>}/>
            </Routes>
        </Router>
      </WebSocketProvider>
  );
}

export default App
