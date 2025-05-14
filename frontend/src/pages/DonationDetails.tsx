import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
  Home,
  Search,
  MessageCircle,
  User,
  Plus as AddIcon,
} from "lucide-react";

export default function DonationDetails() {
  const { id } = useParams(); // Get the donation ID from the URL
  const navigate = useNavigate();
  const [donation, setDonation] = useState<any>(null);
  const [amount, setAmount] = useState(1); // Use "amount" instead of "quantity"

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await fetch(`http://localhost:3000/food-donations/${id}`);
        const data = await response.json();
        setDonation(data);
      } catch (error) {
        console.error("Error fetching donation details:", error);
      }
    };

    fetchDonation();
  }, [id]);

  const handleClaim = () => {
    // Logic for claiming the donation
    console.log(`Claiming ${amount} of ${donation.productName}`);
  };

  if (!donation) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center px-4 pt-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-md"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <span className="font-medium text-gray-700 text-lg">Donation Details</span>
        <div className="w-6" /> {/* Placeholder for alignment */}
      </header>

      {/* Main Content */}
      <main className="px-4 pb-20">
        <div className="relative w-full h-[300px] rounded-lg overflow-hidden mb-6">
          <img
            src={donation.image_url || "https://via.placeholder.com/150"}
            alt={donation.productName}
            className="w-full h-full object-cover"
          />
          {!donation.image_url && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 text-white text-lg font-bold">
              No Image Available
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4">{donation.productName}</h1>

        <div className="space-y-2 text-gray-600 mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>
              {donation.pickupHours
                ? `${donation.pickupHours} (${(() => {
                    switch (donation.pickupHours) {
                      case "morning":
                        return "08:00 AM - 12:00 PM";
                      case "afternoon":
                        return "12:00 PM - 05:00 PM";
                      case "evening":
                        return "05:00 PM - 09:00 PM";
                      default:
                        return "09:30 AM - 08:30 PM";
                    }
                  })()})`
                : "09:30 AM - 08:30 PM"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{new Date(donation.expirationDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>{donation.address || "Unknown address"}</span>
          </div>
        </div>

        <div className="border-t border-b py-4 mb-6">
          <p className="text-gray-700">{donation.description}</p>
          {donation.dietary_notes && (
            <p className="mt-2 text-gray-600">Note: {donation.dietary_notes}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* Send Message Button */}
          <button
            className="flex-1 bg-gray-200 py-3 rounded-lg flex items-center justify-center"
            onClick={() =>
             navigate(`/chat/${donation.userId}?donationId=${donation.id}`)
         }
       >
            <MessageSquare className="h-5 w-5" />
          </button>

          {/* Quantity Controls */}
          <div className="flex-1 ml-4 flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2">
            <button
              onClick={() => setAmount((a) => Math.max(1, a - 1))} // Decrease amount, minimum is 1
              className="p-1"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="font-medium">{amount}</span>
            <button
              onClick={() => setAmount((a) => Math.min(donation.amount, a + 1))} // Limit to donation.amount
              className="p-1"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            className="flex-1 ml-4 bg-[#6B9F9F] text-white py-3 rounded-lg shadow-md hover:bg-[#5A8F8F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B9F9F]"
          >
            Claim
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[430px] bg-white border-t shadow-sm z-50">
        <div className="relative flex justify-between items-center px-6 py-3">
          <button className="p-2 text-[#6B9F9F]" onClick={() => navigate("/home", { replace: true })}>
            <Home className="h-6 w-6" />
          </button>
          <button className="p-2 text-gray-600 hover:text-[#6B9F9F] mr-8" onClick={() => navigate("/search-donation")}>
            <Search className="h-6 w-6" />
          </button>
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-5 z-10">
            <button
              onClick={() => navigate("/upload-food")}
              className="bg-[#6B9F9F] text-white w-14 h-14 rounded-full shadow-md flex items-center justify-center"
            >
              <AddIcon className="w-6 h-6" />
            </button>
          </div>
          <button className="p-2 text-gray-600 hover:text-[#6B9F9F] ml-8" onClick={() => navigate("/messages")}>
            <MessageCircle className="h-6 w-6" />
          </button>
          <button className="p-2 text-gray-600 hover:text-[#6B9F9F]" onClick={() => navigate("/my-profile")}>
            <User className="h-6 w-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}