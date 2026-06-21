import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateRoom from "./pages/CreateRoom";
import './App.css';

function App() {
  return (
      <div>
        <Router>
            <Routes>
                <Route path="/" element={<CreateRoom/>}/>
            </Routes>
        </Router>
      </div>
  );
}

export default App
