import {
  MapPin,
  AlertCircle,
  Loader2,
  Home,
  Plus,
  Search,
  MessageCircle,
  User,
  Map,
  Filter,
  LogOut,
  Star, // Import the Star icon
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import Spinner from "../components/ui/Spinner";

interface Donation {
  id: number;
  image_url?: string;
  productName: string;
  category: string;
  latitude?: number;
  longitude?: number;
}

interface UserLocation {
  latitude: number | null;
  longitude: number | null;
  name: string;
}

interface HomePageProps {
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    credit: number; // Add credit to the user interface
  } | null;
  onLogout: () => void;
}

export default function HomePage({ user, onLogout }: HomePageProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const navigate = useNavigate();
  const [userCredit, setUserCredit] = useState(user?.credit || 0);

  useEffect(() => {
  if (!user?.id) return;

  const fetchCredit = async () => {
    try {
      const res = await fetch(`http://localhost:3000/users/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();
      setUserCredit(data.credit);
    } catch (err) {
      console.error("Error fetching credit:", err);
    }
  };

  fetchCredit(); // fetch immediately

  const interval = setInterval(fetchCredit, 5000); // every 5 seconds

  return () => clearInterval(interval); // cleanup on unmount
}, [user?.id]);


  // 1. שליפת מיקום ראשונית
  useEffect(() => {
    if (user?.id) {
      fetchUserLocation(parseInt(user.id)); // נשלח בקשה לשרת להביא מיקום
    } else {
      initializeLocation(); // רק אם אין יוזר, ננסה מהמכשיר
    }
  }, []);

  // 2. טעינת תרומות אחרי שיש מיקום
  useEffect(() => {
    if (userLocation) {
      loadDonations();
    }
  }, [userLocation]);

  // 3. הפניה להגדרת מיקום אם אין מיקום למשתמש
  useEffect(() => {
    if (
      user &&
      (!userLocation ||
        userLocation.latitude == null ||
        userLocation.longitude == null)
    ) {
      // מחכים רגע לראות אם ייקבע מיקום, אחרת מפנים
      const timeout = setTimeout(() => {
        navigate("/location-setup");
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [user, userLocation]);
  

  
  const initializeLocation = () => {
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location retrieved:", position.coords); // 🛠️ נוסיף לראות בקונסול
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: "Near you",
          });
        },
        (error) => {
          console.error("Error getting location:", error); // 🛠️ נדפיס שגיאה אם יש
          setShowLocationAlert(true);
          setUserLocation({
            name: "Location unavailable",
            latitude: null,
            longitude: null,
          });
        },
        {
          timeout: 10000,
          maximumAge: 60000,
          enableHighAccuracy: true, // 🛠️ נוסיף כדי לנסות מיקום מדויק יותר
        }
      );
    } catch (error) {
      console.error("Exception getting location:", error); // 🛠️ גם כאן לטפל בשגיאה חריגה
      setShowLocationAlert(true);
      setUserLocation({
        name: "Location unavailable",
        latitude: null,
        longitude: null,
      });
    }
  };

  async function saveUserLocation(
    userId: number,
    latitude: number,
    longitude: number,
    address: string
  ) {
    try {
      const response = await fetch("http://localhost:3000/user-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          latitude,
          longitude,
          address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save location");
      }

      const data = await response.json();
      console.log("Location saved successfully:", data);
    } catch (error) {
      console.error("Error saving location:", error);
    }
  }

  async function fetchUserLocation(userId: number) {
    try {
      const response = await fetch(
        `http://localhost:3000/user-location/${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user location");
      }

      const data = await response.json();

      if (data.latitude && data.longitude) {
        setUserLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          name: data.address || "Near you",
        });
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
    }
  }

  

  const loadDonations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/food-donations");
      const items = await res.json();

      const sortedItems = items.sort((a: Donation, b: Donation) => {
        if (!userLocation?.latitude || !userLocation?.longitude) return 0;
        if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;

        const R = 6371; // רדיוס כדור הארץ בקילומטרים
        const dLatA = ((a.latitude - userLocation.latitude) * Math.PI) / 180;
        const dLonA = ((a.longitude - userLocation.longitude) * Math.PI) / 180;
        const dLatB = ((b.latitude - userLocation.latitude) * Math.PI) / 180;
        const dLonB = ((b.longitude - userLocation.longitude) * Math.PI) / 180;

        const aA =
          Math.sin(dLatA / 2) * Math.sin(dLatA / 2) +
          Math.cos((userLocation.latitude * Math.PI) / 180) *
            Math.cos((a.latitude * Math.PI) / 180) *
            Math.sin(dLonA / 2) * Math.sin(dLonA / 2);

        const aB =
          Math.sin(dLatB / 2) * Math.sin(dLatB / 2) +
          Math.cos((userLocation.latitude * Math.PI) / 180) *
            Math.cos((b.latitude * Math.PI) / 180) *
            Math.sin(dLonB / 2) * Math.sin(dLonB / 2);

        const distanceA = R * 2 * Math.atan2(Math.sqrt(aA), Math.sqrt(1 - aA));
        const distanceB = R * 2 * Math.atan2(Math.sqrt(aB), Math.sqrt(1 - aB));

        return distanceA - distanceB;
      });

      setDonations(sortedItems);
    } catch (error) {
      console.error("Error loading donations:", error);
    }
    setIsLoading(false);
  };

  async function handleAddressSubmit() {
    if (!address) return;

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const location = data.results[0].geometry.location;

        setUserLocation({
          latitude: location.lat,
          longitude: location.lng,
          name: address,
        });

        localStorage.setItem(
          "userLocation",
          JSON.stringify({
            latitude: location.lat,
            longitude: location.lng,
            name: address,
          })
        );

        setIsPopoverOpen(false);

        if (user?.id) {
          await saveUserLocation(
            parseInt(user.id),
            location.lat,
            location.lng,
            address
          );
        }
      } else {
        console.error("Geocoding error:", data.status);
        alert("Address not found. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("Failed to fetch location. Please try again.");
    }
  }

  function getApproximateDistance(donation: Donation): string {
    const distances = [0.2, 0.5, 0.7, 1.1, 1.3, 1.7, 2.2, 2.6, 3.1, 3.8, 4.5];
    const randomIndex = donation.id % distances.length;
    return `${distances[randomIndex]}km`;
  }

  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): string | null {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1
      ? `${(distance * 1000).toFixed(0)}m`
      : `${distance.toFixed(1)}km`;
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-gray-50">
      {showLocationAlert && (
        <Alert variant="warning" className="m-4 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>Location access denied. Showing approximate distances.</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowLocationAlert(false)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <header className="flex justify-between items-center mb-6 px-4 pt-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">
            {!userLocation ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Getting location...
              </span>
            ) : (
              userLocation.name
            )}
          </span>
        </div>
        <TooltipProvider>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Star Icon with Credit */}
            {user && (
              <div className="flex items-center gap-1">
                 {/* Log user credit in the console */}
                 {(() => {
                   console.log("User credit:", user.credit);
                   return null;
                 })()}
                <Star className="w-4 h-4 text-yellow-500" />
               <span className="text-sm font-medium text-gray-700">
                  {userCredit}
                </span>

              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Filter className="w-4 h-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Filter</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsPopoverOpen(true)}
                    >
                      <Map className="w-4 h-4 text-gray-600" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="end"
                    sideOffset={8}
                    className="max-w-[90vw] w-[300px] rounded-xl border bg-white p-4 shadow-md text-gray-700"
                  >
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Enter your address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-3 rounded-lg border-2 border-[#D6D1C8] bg-white text-[#5F9C9C] placeholder-[#5F9C9C] shadow-none focus:outline-none focus:ring-0"
                      />
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleAddressSubmit();
                          setIsPopoverOpen(false);
                        }}
                        className="bg-[#D6D2C4] text-[#5F9C9C] hover:bg-[#c9c5b8] w-full"
                      >
                        Save Location
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>Map</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onLogout();
                    navigate("/");
                  }}
                >
                  <LogOut className="w-4 h-4 text-gray-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Logout</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </header>
      <div className="grid grid-cols-2 gap-4 px-4">
        {isLoading ? (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-white">
            <Spinner />
          </div>
        ) : (
          donations.map((donation) => (
            <div
              key={donation.id}
              className="space-y-2"
              onClick={() => navigate(`/donation-details/${donation.id}`)}
            >
              <div className="aspect-square relative rounded-xl overflow-hidden">
                <img
                  src={
                    donation.image_url?.startsWith("http")
                      ? donation.image_url
                      : "/default-image.png"
                  }
                  alt={donation.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-image.png";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-black/40 text-white">
                    {userLocation?.latitude != null &&
                    userLocation?.longitude != null &&
                    donation.latitude != null &&
                    donation.longitude != null
                      ? calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          donation.latitude,
                          donation.longitude
                        )
                      : getApproximateDistance(donation)}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                  <h3 className="font-semibold text-sm text-white">
                    {donation.productName}
                  </h3>
                </div>
              </div>
              <span className="text-xs text-gray-500 capitalize block px-1">
                {donation.category.replace("_", " ")}
              </span>
            </div>
          ))
        )}
      </div>

      <footer className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[430px] bg-white border-t shadow-sm z-50">
        <div className="relative flex justify-between items-center px-6 py-3">
          <button
            className="p-2 text-[#6B9F9F]"
            onClick={() => navigate("/home", { replace: true })}
          >
            <Home className="h-6 w-6" />
          </button>
          <button
            className="p-2 text-gray-600 hover:text-[#6B9F9F] mr-8"
            onClick={() => navigate("/search-donation")}
          >
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
          <button
            className="p-2 text-gray-600 hover:text-[#6B9F9F] ml-8"
            onClick={() => navigate("/user-chats")}
          >
            <MessageCircle className="h-6 w-6" />
          </button>
          <button
            className="p-2 text-gray-600 hover:text-[#6B9F9F]"
            onClick={() => navigate("/my-profile", { state: { user } })}
          >
            <User className="h-6 w-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}