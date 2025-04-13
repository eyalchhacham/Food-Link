import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UploadFood from "./pages/UploadFood";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";

export type User = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
};

function App() {
  const [user, setUser] = useState<User | null>(null);

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
              setUser={(user: User) => {
                setUser(user);
              }}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <Signup
              setUser={(user: User) => {
                setUser(user);
              }}
            />
          }
        />
        <Route path="/upload-food" element={<UploadFood user={user} />} />
        <Route
          path="/my-profile"
          element={
            <ProfilePage
              setUser={(user: User) => {
                setUser(user);
              }}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
