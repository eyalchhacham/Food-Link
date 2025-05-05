import { ChevronLeft, MapPin, Home, Search, MessageCircle, User as IconUser, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "../App";
import { useState, useEffect } from "react";

export function ProfilePage({ setUser }: { setUser: (user: User) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user as User;
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [message, setMessage] = useState("");
  const [newName, setNewName] = useState(null);

  // State for user location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 32.0853, // Default latitude (Tel Aviv)
    lng: 34.7818, // Default longitude (Tel Aviv)
  });

  // Fetch user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error fetching location:", error);
        // Keep the default location if geolocation fails
      }
    );
  }, []);

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
      console.log("Updated user:", updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile. Please try again.");
    }
  };

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
              src="https://images.unsplash.com/photo-1502759683299-cdcd6974244f?auto=format&fit=crop&w=200&h=200"
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
          <button className="mt-2 text-teal-600 text-sm">
            Edit profile image
          </button>
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
              <div className="absolute inset-0">
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
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <MapPin className="w-8 h-8 text-purple-600 fill-current" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
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