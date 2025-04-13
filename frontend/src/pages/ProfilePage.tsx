import { ChevronLeft, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "../App";

export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user as User; // Retrieve user from state

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
        <h2 className="text-xl font-medium mb-6">Hello Omer!</h2>

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

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name:</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-100 rounded"
              defaultValue={user.name}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Email:</label>
            <input
              type="email"
              defaultValue={user.email}
              className="w-full p-2 bg-gray-100 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Phone number:
            </label>
            <input
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
                  src="https://www.openstreetmap.org/export/embed.html?bbox=34.77,32.07,34.78,32.08&layer=mapnik"
                  className="filter grayscale"
                ></iframe>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <MapPin className="w-8 h-8 text-purple-600 fill-current" />
              </div>
            </div>
          </div>

          <button className="w-full py-3 bg-gray-200 rounded-lg mt-8">
            save changes
          </button>
        </div>
      </div>
    </div>
  );
}
