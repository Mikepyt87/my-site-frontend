import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Header";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Header />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
