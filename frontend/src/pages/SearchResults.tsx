import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Button } from "../components/ui/button";
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
  }: {
    query: string;
    userLocation: string;
    coords: { lat: number; lng: number };
    user: UserType;
  } = location.state || {};

  const [userLocation, setUserLocation] = useState(initialUserLocation || "Unknown");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(initialCoords || null);
  const [donations, setDonations] = useState<DonationWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState(query || "");

  useEffect(() => {
    if (!coords || !searchText) return;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:3000/food-donations");
        const data = await res.json();
      
        const filtered = data.filter((donation: Donation) => {
          const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, "_");
          const matchesQuery =
            !searchText ||
            donation.productName.toLowerCase().includes(searchText.toLowerCase()) ||
            normalize(donation.category) === normalize(searchText);
          if (!coords || !donation.latitude || !donation.longitude) return false;

          const R = 6371;
          const dLat = ((donation.latitude - coords.lat) * Math.PI) / 180;
          const dLon = ((donation.longitude - coords.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((coords.lat * Math.PI) / 180) *
              Math.cos((donation.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          //console.log("donation:", donation.productName, "| category:", donation.category, "| query:", searchText, "| match:", matchesQuery);

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
        console.error("Error filtering search results:", err);
      } finally {
        setIsLoading(false); 
      }
    };

    fetchResults();
  }, [searchText, coords]);

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
        <div className="mb-4 flex items-center gap-2">
          <ArrowLeft className="text-gray-700 cursor-pointer" onClick={() => navigate("/search-donation")} />
          <div className="flex-1">
            <div className="w-full bg-gray-100 px-4 py-2 rounded-full flex items-center">
              <input
                type="text"
                className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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
                <Button
                  size="sm"
                  onClick={handleAddressSubmit}
                  className="bg-[#D6D2C4] text-[#5F9C9C] hover:bg-[#c9c5b8] w-full"
                >
                  Save Location
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
  
        {isLoading ? (
          <div className="absolute inset-0 flex justify-center items-center bg-white z-50">
            <Spinner />
          </div>
        ) : donations.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No matching donations found.</p>
        ) : (
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

