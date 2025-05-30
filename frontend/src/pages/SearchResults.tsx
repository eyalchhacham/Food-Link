import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import {
  ArrowLeft,
  MapPin,
  Home,
  Search,
  Plus,
  MessageCircle,
  User,
  X,
  Bot,
} from "lucide-react";

import type { Donation, User as UserType } from "../App";

type DonationWithDistance = Donation & { distance: number };

export default function SearchResults() {
  const [addressInput, setAddressInput] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    query,
    userLocation: initialUserLocation,
    coords: initialCoords,
    user,
    isAI = false,
  }: {
    query: string;
    userLocation: string;
    coords: { lat: number; lng: number };
    user: UserType;
    isAI?: boolean;
  } = location.state || {};

  const [userLocation, setUserLocation] = useState(initialUserLocation || "Unknown");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(initialCoords || null);
  const [donations, setDonations] = useState<DonationWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState(query || "");
  const [aiMode, setAiMode] = useState(isAI || false);

  const [shouldSearch, setShouldSearch] = useState(Boolean(query && coords));

  useEffect(() => {
    if (!shouldSearch || !coords || !searchText) return;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        if (aiMode) {
          // Send AI recommendation request
          const res = await fetch("http://localhost:3000/api/ai/recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userDescription: searchText,
              coords
            }),
          });
          const data = await res.json();

          if (Array.isArray(data.matchingDonations)) {
            const enriched = data.matchingDonations
            .filter((donation: Donation) => donation.status === "available")
            .map((donation: Donation) => {
              const R = 6371;
              const dLat = ((donation.latitude! - coords.lat) * Math.PI) / 180;
              const dLon = ((donation.longitude! - coords.lng) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos((coords.lat * Math.PI) / 180) *
                  Math.cos((donation.latitude! * Math.PI) / 180) *
                  Math.sin(dLon / 2) ** 2;
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = R * c;
              return { ...donation, distance };
            });
            setDonations(enriched);
          } else {
            setDonations([]);
          }
          setIsLoading(false);
          setShouldSearch(false); 
          return;
        }

        // Regular search
        const res = await fetch("http://localhost:3000/food-donations");
        const data = await res.json();

        const filtered = data
        .filter((donation: Donation) => donation.status === "available") 
        .filter((donation: Donation) => {          const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, "_");
          const matchesQuery =
            !searchText ||
            donation.productName.toLowerCase().includes(searchText.toLowerCase()) ||
            normalize(donation.category) === normalize(searchText);
          if (!coords || !donation.latitude || !donation.longitude) return false;

          const R = 6371;
          const dLat = ((donation.latitude - coords.lat) * Math.PI) / 180;
          const dLon = ((donation.longitude - coords.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((coords.lat * Math.PI) / 180) *
              Math.cos((donation.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return matchesQuery && distance < 20;
        });

        const filteredWithDistance = filtered.map((donation: Donation): DonationWithDistance => {
          const R = 6371;
          const dLat = ((donation.latitude! - coords.lat) * Math.PI) / 180;
          const dLon = ((donation.longitude! - coords.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((coords.lat * Math.PI) / 180) *
              Math.cos((donation.latitude! * Math.PI) / 180) *
              Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          return { ...donation, distance };
        }).sort((a: DonationWithDistance, b: DonationWithDistance) => a.distance - b.distance);

        setDonations(filteredWithDistance);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setIsLoading(false);
        setShouldSearch(false); // לא לחפש שוב עד Enter נוסף
      }
    };

    fetchResults();
  }, [shouldSearch, coords, searchText, aiMode]); 

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

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-white">
      <div className="p-4">
        {/* Top bar with search, AI toggle (outside the search bar, side-by-side) */}
        <div className="mb-4 flex items-center gap-2">
          <ArrowLeft className="text-gray-700 cursor-pointer" onClick={() => navigate("/search-donation")} />
          {/* Search input */}
          <div className="flex-1">
            <div className="w-full bg-gray-100 px-4 py-2 rounded-full flex items-center">
              <input
                type="text"
                className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
                placeholder={aiMode ? "Ask anything with AI..." : "Search food and items"}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchText.trim()) {
                    setSearchText(searchText.trim());
                    setShouldSearch(true); 
                  }
                }}
              />
              {searchText && (
                <X
                  className="w-4 h-4 text-gray-500 cursor-pointer"
                  onClick={() => {
                    setSearchText("");
                    setDonations([]);
                  }}
                />
              )}
            </div>
          </div>
          {/* AI Toggle Button - now outside the search bar */}
          <button
            onClick={() => setAiMode((prev) => !prev)}
            className={`flex flex-col items-center justify-center rounded-full w-12 h-12 shadow-md transition text-[10px]
              ${aiMode
                ? "bg-[#D6D2C4]" 
                : "bg-[#6B9F9F] hover:bg-[#548686]"} // Teal (inactive)
            `}
            title="Toggle AI Mode"
            type="button"
            style={{
              color: aiMode ? '#5F9C9C' : 'white',
              marginLeft: '8px'
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-7"
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
  
        {isLoading ? (
          <div className="absolute inset-0 flex justify-center items-center bg-white z-50">
            <Spinner />
          </div>
        ) : donations.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            {aiMode
              ? "No matching AI recommendations found."
              : "No matching donations found."}
          </p>
        ) : (
          <>
            {/* AI Recommendations badge */}
            {aiMode && donations.length > 0 && (
              <div className="flex items-center justify-center mb-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e8e6e0] text-[#5F9C9C] text-xs font-medium shadow">
                  <Bot className="w-4 h-4" /> AI Recommendations
                </span>
              </div>
            )}
            <div className="flex flex-col gap-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex flex-row border rounded-xl shadow-sm p-3 cursor-pointer hover:shadow-md transition text-left"
                  onClick={() => navigate(`/donation-details/${donation.id}`)}
                >
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 mr-4">
                    <img
                      src={donation.image_url?.startsWith("http") ? donation.image_url : "/default-image.png"}
                      alt={donation.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/default-image.png";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-800">
                      {donation.productName} <span className="text-gray-500">|</span>{" "}
                      <span className="capitalize">{donation.category.replace("_", " ")}</span>
                    </h3>
                    {donation.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {donation.description.length > 60
                          ? donation.description.slice(0, 60) + "..."
                          : donation.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {donation.distance?.toFixed(1)} km
                      <span className="mx-1">•</span>
                      {donation.pickupDate
                        ? new Date(donation.pickupDate).toLocaleDateString("en-GB").split("/").join("-")
                        : "No date"}
                      <span className="mx-1">•</span>
                      {donation.pickupHours || "No time"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
  
      <footer className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[430px] bg-white border-t shadow-sm z-50">
        <div className="relative flex justify-between items-center px-6 py-3">
          <button className="p-2 text-gray-600 hover:text-[#6B9F9F]" onClick={() => navigate("/home", { replace: true })}>
            <Home className="h-6 w-6" />
          </button>
          <button className="p-2 text-[#6B9F9F] mr-8">
            <Search className="h-6 w-6" />
          </button>
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-5 z-10">
            <button
              onClick={() => navigate("/upload-food")}
              className="bg-[#6B9F9F] text-white w-14 h-14 rounded-full shadow-md flex items-center justify-center"
            >
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
