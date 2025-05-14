import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UploadFood from "./pages/UploadFood";
import HomePage from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import SearchDonation from "./pages/SearchDonations";
import SearchResults from "./pages/SearchResults";
import DonationDetails from "./pages/DonationDetails"; 
import LocationSetup from "./pages/LocationSetup"; 
import { GoogleOAuthProvider } from "@react-oauth/google"; // צריך להתקין npm install @react-oauth/google
import ChatPage from "./pages/ChatPage";

export type User = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  image_url: string;
  
};

export interface Donation {
  id: number;
  image_url?: string;
  productName: string;
  category: string;
  latitude?: number;
  longitude?: number;
  pickupDate?: string;       
  pickupHours?: string;      
  description?: string;
}

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
        <Route
          path="/location-setup"
          element={<LocationSetup user={user} />} 
        />
        <Route path="/search-donation" element={<SearchDonation user={user} />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/donation-details/:id" element={<DonationDetails />} />
        <Route path="/chat/:id" element={<ChatPage />} />
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
