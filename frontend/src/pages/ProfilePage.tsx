import { ChevronLeft, MapPin } from "lucide-react";
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
    <div className="max-w-[430px] mx-auto min-h-screen bg-white">
      {/* Header */}
      <div className="p-4 flex items-center border-b">
        <ChevronLeft
          onClick={() => {
            navigate("/home");
          }}
          className="w-6 h-6"
        />
        <h1 className="flex-1 text-center text-lg font-medium">Edit Profile</h1>
      </div>

      <div className="p-6">
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
          className="space-y-4"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name:</label>
              <input
                type="text"
                className="w-full p-2 bg-gray-100 rounded"
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
                className="w-full p-2 bg-gray-100 rounded"
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
                className="w-full p-2 bg-gray-100 rounded"
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
              className="w-full py-3 bg-gray-200 rounded-lg mt-8"
            >
              save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}