import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Welcome from "./components/Welcome";
import ProfessionalServices from "./components/ProfessionalServices";
import PersonalPage from "./components/PersonalPage";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/personal-page" element={<PersonalPage />} />
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
