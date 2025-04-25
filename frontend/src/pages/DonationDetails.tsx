import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
} from "lucide-react";

export default function DonationDetails() {
  const { id } = useParams(); // Get the donation ID from the URL
  const navigate = useNavigate();
  const [donation, setDonation] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

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

  if (!donation) {
    return <p>Loading donation details...</p>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-md"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <div className="bg-gray-200 h-64">
          <img
            src={donation.image_url || "https://via.placeholder.com/150"}
            alt={donation.productName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">{donation.productName}</h1>

        <div className="flex items-center space-x-2 text-gray-600 mb-2">
          <Clock className="h-5 w-5" />
          <span>{donation.pickupHours || "09:30 AM-08:30 PM"}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-600 mb-2">
          <Calendar className="h-5 w-5" />
          <span>{new Date(donation.expirationDate).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-600 mb-2">
          <MapPin className="h-5 w-5" />
          <span>{donation.address || "Unknown address"}</span>
        </div>

        <div className="border-t border-b py-4 my-6">
          <p className="text-gray-700">{donation.description}</p>
          {donation.dietary_notes && (
            <p className="mt-2 text-gray-600">Note: {donation.dietary_notes}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button className="flex-1 bg-gray-200 py-3 rounded-lg flex items-center justify-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Send Message</span>
          </button>
          <div className="flex-1 ml-4 flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
