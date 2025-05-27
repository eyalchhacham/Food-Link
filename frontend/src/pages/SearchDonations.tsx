import React, { useEffect, useState } from "react";
import {
  Home,
  Search,
  MessageCircle,
  User,
  MapPin,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";

const categories = [
  "prepared meals", "fresh produce", "canned goods", "bakery", "dairy", "meat",
  "snacks", "frozen foods", "beverages", "grains", "pasta", "baking ingredients",
  "sauces", "spices", "condiments", "nuts & seeds", "breakfast cereals", "baby food",
  "plant-based alternatives"
];

import type { User as UserType } from "../App";

interface SearchDonationProps {
  user: UserType | null;
}

export default function SearchDonation({ user }: SearchDonationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<string>("Getting location...");
  const [addressInput, setAddressInput] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchUserLocation(parseInt(user.id));
    }
  }, [user]);

  async function fetchUserLocation(userId: number) {
    try {
      const response = await fetch(`http://localhost:3000/user-location/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user location");

      const data = await response.json();
      if (data?.address) {
        setUserLocation(data.address);
        setAddressInput(data.address);
        if (data.latitude && data.longitude) {
          setCoords({ lat: data.latitude, lng: data.longitude });
        }
      } else {
        setUserLocation("Location not available");
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
      setUserLocation("Location unavailable");
    }
  }

  async function saveUserLocation(userId: number, latitude: number, longitude: number, address: string) {
    try {
      const response = await fetch("http://localhost:3000/user-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, latitude, longitude, address }),
      });

      if (!response.ok) throw new Error("Failed to save location");
    } catch (error) {
      console.error("Error saving location:", error);
    }
  }

  async function handleAddressSubmit() {
    if (!addressInput) return;

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressInput)}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const location = data.results[0].geometry.location;
        setUserLocation(addressInput);
        setCoords({ lat: location.lat, lng: location.lng });
        setIsPopoverOpen(false);

        if (user?.id) {
          await saveUserLocation(parseInt(user.id), location.lat, location.lng, addressInput);
        }
      } else {
        alert("Address not found. Please try again.");
      }
    } catch (error) {
      console.error("Error updating address:", error);
    }
  }

  const goToSearchResults = (query: string, useAI: boolean = false) => {
    if (!coords || !query) return;
    navigate("/search-results", {
      state: {
        query,
        userLocation,
        coords,
        user,
        isAI: useAI,
      },
    });
  };

  const handleCategoryClick = (category: string) => {
    setSearchQuery((prev) => {
      if (prev.toLowerCase().includes(category.toLowerCase())) return prev;
      return prev.length > 0 ? `${prev} ${category}` : category;
    });
    goToSearchResults(category, false);
  };

  if (!user) {
    return <div className="text-center py-10 text-gray-500">Please log in to use this feature.</div>;
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-white">
      <div className="p-4">

        {/* Search bar + AI button - Separated */}
        <div className="mb-2 flex items-center gap-2">
  {/* Search bar */}
  <input
    type="text"
    className="flex-1 bg-gray-100 px-4 py-2 rounded-full min-h-[40px] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
    placeholder={aiMode ? "Ask anything with AI..." : "Search food and items"}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        goToSearchResults(searchQuery.trim(), aiMode); // aiMode true=AI, false=regular
      }
    }}
  />

  {/*  AI Toggle Button */}
  <button
    onClick={() => setAiMode(!aiMode)}
    className={`flex flex-col items-center justify-center rounded-full w-12 h-12 shadow-md transition text-xs
      ${aiMode
        ? "bg-[#D6D2C4]"       // Cream background when AI is active
        : "bg-[#6B9F9F] hover:bg-[#548686]"} // Teal background when normal
    `}
    title="Toggle AI Mode"
    type="button"
    style={{
      color: aiMode ? '#5F9C9C' : 'white', // Teal text on cream, white on teal
    }}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`w-9 h-8`}
      style={{ color: aiMode ? '#5F9C9C' : 'white' }}
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <rect x="5" y="8" width="14" height="9" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="8.5" cy="12.5" r="1" fill="currentColor"/>
      <circle cx="15.5" cy="12.5" r="1" fill="currentColor"/>
      <rect x="10" y="15" width="4" height="1" rx="0.5" fill="currentColor"/>
      <rect x="11.25" y="4" width="1.5" height="4" rx="0.75" fill="currentColor"/>
      <rect x="3" y="13" width="2" height="1.5" rx="0.75" fill="currentColor"/>
      <rect x="19" y="13" width="2" height="1.5" rx="0.75" fill="currentColor"/>
    </svg>
    <span
      className="leading-tight"
      style={{
        marginTop: '-8px',
        fontSize: '10px',
        color: aiMode ? '#5F9C9C' : 'white'
      }}
    >
      Ask AI
    </span>
  </button>
</div>

        {/* Location line */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <MapPin className="w-4 h-4 text-[#6B9F9F]" />
          <span className="text-black">Search near</span>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <span className="text-[#6B9F9F] cursor-pointer flex items-center gap-1">
                <span className="font-medium">{userLocation}</span>
                <ChevronDown className="w-4 h-4 text-[#6B9F9F]" />
              </span>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={8}
              className="max-w-[90vw] w-[300px] rounded-xl border bg-white p-4 shadow-md text-gray-700"
            >
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter your address..."
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full p-3 rounded-lg border-2 border-[#D6D1C8] bg-white text-[#5F9C9C] placeholder-[#5F9C9C] shadow-none focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={handleAddressSubmit}
                  className="w-full py-2 rounded-lg font-semibold text-base bg-[#D6D2C4] text-[#5F9C9C] hover:bg-[#c9c5b8] transition"                >
                  Save Location
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 px-4 mt-4 justify-center">
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium shadow-sm cursor-pointer transition-all bg-[#6B9F9F] text-white text-center"
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom navigation */}
      <footer className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[430px] bg-white border-t shadow-sm z-50">
        <div className="relative flex justify-between items-center px-6 py-3">
          <button className="p-2 text-gray-600 hover:text-[#6B9F9F]" onClick={() => navigate("/home", { replace: true })}>
            <Home className="h-6 w-6" />
          </button>
          <button className="p-2 text-[#6B9F9F] mr-8">
            <Search className="h-6 w-6" />
          </button>
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-5 z-10">
            <button onClick={() => navigate("/upload-food")} className="bg-[#6B9F9F] text-white w-14 h-14 rounded-full shadow-md flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <button className="p-2 text-gray-600 hover:text-[#6B9F9F] ml-8"  onClick={() => navigate("/user-chats")}>
            <MessageCircle className="h-6 w-6" />
          </button>
          <button className="p-2 text-gray-600 hover:text-[#6B9F9F]" onClick={() => navigate("/my-profile", { state: { user } })}>
           <User className="h-6 w-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}
