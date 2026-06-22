import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateRoom from "./pages/CreateRoom";
import Prompting from "./pages/Prompting";
import './App.css';

function App() {
  return (
      <div>
        <Router>
            <Routes>
                <Route path="/" element={<CreateRoom/>}/>
                <Route path="/prompts" element={<Prompting/>}/>
            </Routes>
        </Router>
      </div>
  );
}

export default App
