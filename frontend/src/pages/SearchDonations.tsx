import React, { useState, useEffect } from "react";
import { Home, Search, MessageCircle, User } from "lucide-react";
import { CategoryChip } from "../components/CategoryChip";
import { SearchBar } from "../components/SearchBar";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch donations from the backend
    const fetchDonations = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append("searchQuery", searchQuery);
        if (selectedCategories.length > 0)
          queryParams.append("category", selectedCategories.join(","));

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
  }, [searchQuery, selectedCategories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pt-8 pb-20">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category.replace("_", " ")} // Display category names in a readable format
              selected={selectedCategories.includes(category)}
              onClick={() => toggleCategory(category)}
            />
          ))}
        </div>

        {/* Donations List */}
        <div className="space-y-4">
          {isLoading ? (
            <p>Loading donations...</p>
          ) : donations.length > 0 ? (
            donations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm"
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
            <p>No donations found.</p>
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
