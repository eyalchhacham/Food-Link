import React, { useState, useEffect } from "react";
import { Home, Search, MessageCircle, User, ArrowLeft } from "lucide-react";
import { CategoryChip } from "../components/CategoryChip";
import { SearchBar } from "../components/SearchBar";
import { useNavigate } from "react-router-dom";

const categories = [
  "prepared_meals",
  "fresh_produce",
  "canned_goods",
  "bakery",
  "dairy",
  "meat",
  "other",
];

export default function SearchDonation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inMyArea, setInMyArea] = useState(false); // State for "In My Area" filter
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null); // User's location
  const navigate = useNavigate();

  useEffect(() => {
    // Check if any filters are active
    const hasFilters = searchQuery || selectedCategories.length > 0 || inMyArea;

    if (!hasFilters) {
      setDonations([]); // Clear donations if no filters are selected
      return;
    }

    // Fetch donations from the backend
    const fetchDonations = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append("searchQuery", searchQuery);
        if (selectedCategories.length > 0)
          queryParams.append("category", selectedCategories.join(","));
        if (inMyArea && userLocation) {
          queryParams.append("latitude", userLocation.latitude.toString());
          queryParams.append("longitude", userLocation.longitude.toString());
          queryParams.append("radius", "20"); // Radius in kilometers
        }

        const response = await fetch(
          `http://localhost:3000/food-donations?${queryParams.toString()}`
        );
        const data = await response.json();
        setDonations(data);
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, [searchQuery, selectedCategories, inMyArea, userLocation]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const handleInMyAreaToggle = () => {
    if (!inMyArea) {
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setInMyArea(true);
          },
          (error) => {
            console.error("Error getting location:", error);
            alert("Unable to fetch your location. Please enable location services.");
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    } else {
      // Disable "In My Area" filter
      setInMyArea(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button and Title Centered */}
      <div className="flex items-center justify-center px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-md mr-2"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold">Search Donations</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-20">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category.replace("_", " ")}
              selected={selectedCategories.includes(category)}
              onClick={() => toggleCategory(category)}
            />
          ))}
        </div>

        {/* "In My Area" Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <CategoryChip
            label="In My Area"
            selected={inMyArea}
            onClick={handleInMyAreaToggle}
          />
        </div>

        {/* Donations List */}
        <div className="space-y-4">
          {isLoading ? (
            <p>Loading donations...</p>
          ) : donations.length > 0 ? (
            donations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm cursor-pointer"
                onClick={() => navigate(`/donation-details/${donation.id}`)}
              >
                <img
                  src={donation.image_url || "https://via.placeholder.com/150"}
                  alt={donation.productName}
                  className="h-16 w-16 rounded-lg object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    {donation.productName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {donation.description}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      donation.status === "available"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {donation.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>No donations found. Please use the filters to search.</p>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-6 py-2">
          <div className="flex justify-between items-center">
            <button className="p-2 text-gray-600 hover:text-teal-500">
              <Home className="h-6 w-6" />
            </button>
            <button className="p-2 text-teal-500">
              <Search className="h-6 w-6" />
            </button>
            <button className="p-2 relative">
              <div className="absolute -top-1 -right-1 h-8 w-8 bg-teal-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">+</span>
              </div>
            </button>
            <button className="p-2 text-gray-600 hover:text-teal-500">
              <MessageCircle className="h-6 w-6" />
            </button>
            <button className="p-2 text-gray-600 hover:text-teal-500">
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}