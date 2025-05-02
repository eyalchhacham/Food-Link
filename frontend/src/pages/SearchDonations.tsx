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
import { Button } from "../components/ui/button";
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

  const goToSearchResults = (query: string) => {
    if (!coords || !query) return;
    navigate("/search-results", {
      state: {
        query,
        userLocation,
        coords,
        user,
      },
    });
  };

  const handleCategoryClick = (category: string) => {
    setSearchQuery((prev) => {
      if (prev.toLowerCase().includes(category.toLowerCase())) return prev;
      return prev.length > 0 ? `${prev} ${category}` : category;
    });
    goToSearchResults(category);
  };

  if (!user) {
    return <div className="text-center py-10 text-gray-500">Please log in to use this feature.</div>;
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-white">
      <div className="p-4">

        {/* Search bar */}
        <div className="mb-2 flex items-center gap-2">
          <div className="flex-1">
            <div className="w-full bg-gray-100 px-4 py-2 rounded-full min-h-[40px] flex items-center">
              <input
                type="text"
                className="w-full bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-gray-400 transition-opacity duration-300 ease-in"
                placeholder="Search food and items"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    goToSearchResults(searchQuery.trim());
                  }
                }}
              />
            </div>
          </div>
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
                  className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <Button
                  size="sm"
                  onClick={handleAddressSubmit}
                  className="bg-emerald-500 text-white hover:bg-emerald-600 w-full"
                >
                  Save Location
                </Button>
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
          <button className="p-2 text-gray-600 hover:text-[#6B9F9F] ml-8" onClick={() => navigate("/messages")}>
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
