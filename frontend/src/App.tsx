import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UploadFood from "./pages/UploadFood";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import SearchDonation from "./pages/SearchDonations";
import DonationDetails from "./pages/DonationDetails";  
import { GoogleOAuthProvider } from "@react-oauth/google"; // צריך להתקין npm install @react-oauth/google


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
  <GoogleOAuthProvider clientId="944261243243-9imvkcre729n8c1elqiiohhklb08tkba.apps.googleusercontent.com"> 
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
        <Route path="/search-donation" element={<SearchDonation />} />
        <Route path="/donation-details/:id" element={<DonationDetails />} />
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
  </GoogleOAuthProvider>
  );
}

export default App;
