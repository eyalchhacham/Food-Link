import React, { useState } from "react";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "../App";

enum Category {
  prepared_meals,
  fresh_produce,
  canned_goods,
  bakery,
  dairy,
  meat,
  other,
}

export default function UploadFood({ user }: { user: User | null }) {
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(1);
  const [description, setDescription] = useState("");
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [pickupHours, setPickupHours] = useState("");
  const [expirationDate, setExpirationDate] = useState<Date | undefined>();
  const [images, setImages] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // State for image previews
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:3000/food-donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          category,
          amount,
          description,
          pickupDate,
          pickupHours,
          expirationDate,
          userId: user ? user.id : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "food donation failed");
      }
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);

      // Generate image previews
      const fileArray = Array.from(e.target.files);
      const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreviews(previewUrls);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <Link to="/home" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-4 text-xl font-semibold text-gray-900">
            Uploading My Food
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {imagePreviews.length === 0 ? (
                <div className="text-center">
                  <ImagePlus className="w-8 h-8 mx-auto text-gray-400" />
                  <span className="mt-2 block text-sm text-gray-500">
                    Add Photos
                  </span>
                </div>
              ) : (
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <img
                    src={imagePreviews[0]} // Show the first preview
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
            <div>
              <label
                htmlFor="productName"
                className="block text-sm font-medium text-gray-700"
              >
                Product Name
              </label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Enter a name of food item"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              >
                <option value="">Select a category</option>
                {Object.keys(Category)
                  .filter((key) => isNaN(Number(key)))
                  .map((key) => (
                    <option key={key} value={key}>
                      {key.replace(/_/g, " ")}{" "}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Except for a few sentences about the product"
                required
              />
            </div>

            <div>
              <label
                htmlFor="pickupDate"
                className="block text-sm font-medium text-gray-700"
              >
                Pick up date
              </label>
              <input
                type="date"
                id="pickupDate"
                value={pickupDate ? pickupDate.toISOString().split("T")[0] : ""}
                onChange={(e) => setPickupDate(new Date(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="pickupHours"
                className="block text-sm font-medium text-gray-700"
              >
                Pick up hours
              </label>
              <select
                id="pickupHours"
                value={pickupHours}
                onChange={(e) => setPickupHours(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              >
                <option value="">Select pickup hours</option>
                <option value="morning">Morning (8AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 9PM)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="expirationDate"
                className="block text-sm font-medium text-gray-700"
              >
                Expiration date
              </label>
              <input
                type="date"
                id="expirationDate"
                value={
                  expirationDate
                    ? expirationDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => setExpirationDate(new Date(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Uploading..." : "Submit"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}