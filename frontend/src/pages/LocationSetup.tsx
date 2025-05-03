import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { MapPin } from "lucide-react";
import type { User } from "../App";

interface LocationSetupProps {
  user: User | null;
}

export default function LocationSetup({ user }: LocationSetupProps) {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const navigate = useNavigate();

  const saveLocationToServer = async (
    latitude: number,
    longitude: number,
    address: string
  ) => {
    if (!user?.id) return;
    try {
      const response = await fetch("http://localhost:3000/user-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parseInt(user.id),
          latitude,
          longitude,
          address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save location");
      }

      navigate("/home");
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Failed to save location. Please try again.");
    }
  };

  const handleManualSubmit = async () => {
    if (!address) {
      alert("Please enter an address.");
      return;
    }

    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const location = data.results[0].geometry.location;
        await saveLocationToServer(location.lat, location.lng, address);
      } else {
        alert("Address not found. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("Failed to fetch location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await saveLocationToServer(latitude, longitude, "Near you");
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Failed to get current location.");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen flex flex-col bg-white border-x border-gray-200 shadow-md">
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <MapPin className="w-12 h-12 text-[#6B9F9F] mb-4" />
        <h1 className="text-2xl font-bold text-center mb-2">
          Where are you located?
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Share your location so we can show nearby donations.
        </p>

        {!manualMode ? (
          <div className="flex flex-col gap-4 w-full">
            <Button
              onClick={handleUseCurrentLocation}
              className="bg-[#6B9F9F] text-white hover:bg-[#5a8f8f] w-full"
              disabled={isLoading}
            >
              {isLoading ? "Locating..." : "Use My Current Location"}
            </Button>
            <Button
              onClick={() => setManualMode(true)}
              className="bg-[#6B9F9F] text-white hover:bg-[#5a8f8f] w-full"
              disabled={isLoading}
            >
              Enter Address Manually
            </Button>
          </div>
        ) : (
          <div className="space-y-3 w-full">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address..."
              className="w-full p-3 rounded-lg border-2 border-[#D6D1C8] bg-white text-[#5F9C9C] placeholder-[#5F9C9C] shadow-none focus:outline-none focus:ring-0"
            />
            <Button
              onClick={handleManualSubmit}
              className="bg-[#D6D2C4] text-[#5F9C9C] hover:bg-[#c9c5b8] w-full"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save and Continue"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}