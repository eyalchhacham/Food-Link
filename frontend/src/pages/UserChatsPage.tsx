import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Home,
  Plus,
  Search,
  MessageCircle,
  User,
} from "lucide-react";
//hihihihihihihi
type ChatPreview = {
  donationId: number;
  otherUserId: number;
  otherUserName: string;
  otherUserImage: string;
  lastMessage: string;
  lastMessageTime: string;
};

type Props = {
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    image_url: string;
    credit: number;
  } | null;
};

export default function UserChatsPage({ user }: Props) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.id) return;

      try {
        const res = await axios.get(
          `http://localhost:3000/user-chats/${user.id}`
        );

          console.log("Chats returned from backend:", res.data);

        setChats(res.data);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, [user?.id]);

  return (
    <div className="h-screen max-w-[430px] mx-auto bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-4 border-b border-gray-300 bg-white">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h2 className="text-xl font-bold text-[#6B9F9F]">My Chats</h2>
      </div>

      {/* Scrollable chat list */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {chats.length === 0 ? (
          <div className="text-center text-gray-600 mt-20">
            <p>No active chats yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Start by messaging a donor from a donation page.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {chats.map((chat, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-gray-100 transition"
                onClick={() =>
                  navigate(
                    `/chat/${chat.otherUserId}?donationId=${chat.donationId}`
                  )
                }
              >
                <img
                  src={
                    chat.otherUserImage && chat.otherUserImage.startsWith("http")
                      ? chat.otherUserImage
                      : "/default-image.png"
                  }
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover mr-4 border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-image.png";
                  }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">
                    {chat.otherUserName}
                  </div>
                  <div className="text-sm text-gray-600 truncate max-w-[250px]">
                    {chat.lastMessage}
                  </div>
                </div>
                <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {chat.lastMessageTime
                    ? new Date(chat.lastMessageTime).toLocaleDateString("he-IL")
                    : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer navigation bar */}
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
            className="p-2 text-gray-600 hover:text-[#6B9F9F]" onClick={() => navigate("/my-profile", { state: { user } })}>
            <User className="h-6 w-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}
