import { ChevronLeft, MapPin, Home, Search, MessageCircle, User as IconUser, Plus, Edit3 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "../App";
import { useState, useEffect } from "react";

export function ProfilePage({ setUser }: { setUser: (user: User) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUserState] = useState<User | null>(location.state?.user || null);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [message, setMessage] = useState("");
  const [newName, setNewName] = useState(null);

  // State for user location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newAddress, setNewAddress] = useState("");
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  // State for profile image
  const [profileImage, setProfileImage] = useState(user?.image_url || "https://images.unsplash.com/photo-1502759683299-cdcd6974244f?auto=format&fit=crop&w=200&h=200");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch user data if not available in location.state
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) {
        try {
          const response = await fetch(`http://localhost:3000/users/${location.state?.userId || 1}`); // Replace `1` with a fallback user ID or logic
          const data = await response.json();
          console.log("Fetched user data:", data);
          setUserState(data);
          setName(data.name);
          setEmail(data.email);
          setPhoneNumber(data.phoneNumber);
          setProfileImage(data.image_url || "https://images.unsplash.com/photo-1502759683299-cdcd6974244f?auto=format&fit=crop&w=200&h=200");
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUser();
  }, [user, location.state]);

  // Fetch user's location from the database
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (user) {
        try {
          const response = await fetch(`http://localhost:3000/user-location/${user.id}`);
          const data = await response.json();
          if (data.latitude && data.longitude) {
            setUserLocation({ lat: data.latitude, lng: data.longitude });
          }
        } catch (error) {
          console.error("Error fetching user location:", error);
        }
      }
    };

    fetchUserLocation();
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phoneNumber }),
      });
      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setNewName(updatedUser.name);
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile. Please try again.");
    }
  };

  const handleUpdateLocation = async () => {
    if (!newAddress) {
      setMessage("Please enter a valid address.");
      return;
    }

    if (!user) {
      setMessage("User information is missing. Please refresh the page.");
      return;
    }

    try {
      // Fetch coordinates for the new address
      const response = await fetch("http://localhost:3000/api/geolocation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: newAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch coordinates");
      }

      const { latitude, longitude } = data;

      // Update the user's location in the database
      await fetch("http://localhost:3000/user-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id, // Ensure user is not null before accessing user.id
          latitude,
          longitude,
          address: newAddress,
        }),
      });

      setUserLocation({ lat: latitude, lng: longitude });
      setMessage("Location updated successfully!");
      setIsEditingLocation(false);
    } catch (error) {
      console.error("Error updating location:", error);
      setMessage("Error updating location. Please try again.");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId", user?.id.toString() || "");

    try {
      setIsUploading(true);
      const response = await fetch("http://localhost:3000/upload-profile-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setProfileImage(data.imageUrl); // Update the profile image URL
      setMessage("Profile image updated successfully!");
    } catch (error) {
      console.error("Error uploading profile image:", error);
      setMessage("Error uploading profile image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>; // Show a loading state while fetching user data
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center px-4 pt-4 mb-6">
        <button
          onClick={() => navigate("/home")}
          className="p-2 bg-white rounded-full shadow-md"
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <span className="font-medium text-gray-700 text-lg">Edit Profile</span>
        <div className="w-6" /> {/* Placeholder for alignment */}
      </header>

      {/* Main Content */}
      <main className="px-4 pb-20">
        <h2 className="text-xl font-medium mb-6">
          Hello {newName ?? user.name}!
        </h2>

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <label
              htmlFor="profileImageUpload"
              className="absolute bottom-0 right-0 bg-[#6B9F9F] text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-[#5A8F8F]"
            >
              <Edit3 className="w-4 h-4" />
            </label>
            <input
              id="profileImageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          {isUploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveChanges();
          }}
          className="space-y-6 bg-white p-6 rounded-lg shadow-sm"
        >
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name:</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-100 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              onChange={(e) => setName(e.target.value)}
              defaultValue={user.name}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Email:</label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              defaultValue={user.email}
              className="w-full p-2 bg-gray-100 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Phone number:
            </label>
            <input
              onChange={(e) => setPhoneNumber(e.target.value)}
              defaultValue={user.phoneNumber}
              type="tel"
              className="w-full p-2 bg-gray-100 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Location Section */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Your location:
            </label>
            <div className="relative w-full h-[200px] bg-gray-100 rounded overflow-hidden">
              {userLocation ? (
                <iframe
                  title="Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    userLocation.lng - 0.01
                  },${userLocation.lat - 0.01},${userLocation.lng + 0.01},${
                    userLocation.lat + 0.01
                  }&layer=mapnik`}
                  className="filter grayscale"
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading map...</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsEditingLocation(true)}
                className="absolute top-2 right-2 bg-[#6B9F9F] text-white p-2 rounded-full shadow-md hover:bg-[#5A8F8F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B9F9F]"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            {isEditingLocation && (
              <div className="mt-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Enter new address:
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full p-2 bg-gray-100 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Enter new address"
                />
                <button
                  type="button"
                  onClick={handleUpdateLocation}
                  className="mt-2 w-full py-2 bg-[#6B9F9F] text-white rounded-lg shadow-sm hover:bg-[#5A8F8F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B9F9F]"
                >
                  Update Location
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#6B9F9F] text-white rounded-lg shadow-sm hover:bg-[#5A8F8F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B9F9F]"
          >
            Save Changes
          </button>
        </form>
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
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <button className="p-2 text-gray-600 hover:text-[#6B9F9F] ml-8" onClick={() => navigate("/messages")}>
            <MessageCircle className="h-6 w-6" />
          </button>
          <button className="p-2 text-gray-600 hover:text-[#6B9F9F]" onClick={() => navigate("/my-profile")}>
            <IconUser className="h-6 w-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}