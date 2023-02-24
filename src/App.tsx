import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Welcome from "./components/Welcome";
import PersonalPortfolio from "./components/PersonalPortfolio";
import ProfessionalServices from "./components/ProfessionalServices";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/personal-portfolio" element={<PersonalPortfolio />} />
          <Route
            path="/professional-services"
            element={<ProfessionalServices />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
