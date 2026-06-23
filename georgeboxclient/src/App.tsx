import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateRoom from "./pages/CreateRoom";
import Prompting from "./pages/Prompting";
import Lobby from "./pages/Lobby";
import { WebSocketProvider} from "./context/WebSocketContext"
import './App.css';

function App() {
  return (
      <WebSocketProvider>
        <Router>
            <Routes>
                <Route path="/" element={<CreateRoom/>}/>
                <Route path="/prompts" element={<Prompting/>}/>
                <Route path="/lobby" element={<Lobby/>}/>
            </Routes>
        </Router>
      </WebSocketProvider>
  );
}

export default App
