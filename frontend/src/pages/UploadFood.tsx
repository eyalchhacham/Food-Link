import React, { useState } from "react";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function UploadFood() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(1);
  const [description, setDescription] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupHours, setPickupHours] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement form submission
      console.log({
        productName,
        category,
        amount,
        description,
        pickupDate,
        pickupHours,
        expirationDate,
        images,
      });
    } catch (error) {
      console.error("Error uploading food:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);
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
              <div className="text-center">
                <ImagePlus className="w-8 h-8 mx-auto text-gray-400" />
                <span className="mt-2 block text-sm text-gray-500">
                  Add Photos
                </span>
              </div>
            </div>
            {/* Preview will be added here when images are selected */}
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
                <option value="fruits">Fruits</option>
                <option value="vegetables">Vegetables</option>
                <option value="dairy">Dairy</option>
                <option value="grains">Grains</option>
                <option value="protein">Protein</option>
                <option value="other">Other</option>
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
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
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
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your location
              </label>
              <div className="mt-1 aspect-video bg-gray-100 rounded-lg">
                {/* Map component will be added here */}
                <div className="w-full h-full bg-gray-200 rounded-lg"></div>
              </div>
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
