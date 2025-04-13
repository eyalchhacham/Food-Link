import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UploadFood from "./pages/UploadFood";
import { HomePage } from "./pages/HomePage";

function App() {
  const [user, setUser] = useState<string | null>(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/home"
          element={<HomePage user={user} onLogout={handleLogout} />}
        />
        <Route
          path="/"
          element={
            <Login
              setUser={(email: string) => {
                setUser(email);
              }}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <Signup
              setUser={(email: string) => {
                setUser(email);
              }}
            />
          }
        />
        <Route path="/upload-food" element={<UploadFood />} />
      </Routes>
    </Router>
  );
}

export default App;
