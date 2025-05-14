import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { supabase } from "../supabase";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const navigate = useNavigate();
  const { id: otherUserIdParam } = useParams(); // /chat/:id
  const [otherUserId, setOtherUserId] = useState<number | null>(null);
  const [otherUserName, setOtherUserName] = useState("");
  const [otherUserImage, setOtherUserImage] = useState("");
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get("donationId");
  const currentUserId = Number(localStorage.getItem("userId"));
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // 1. קובעת את המשתמש השני מתוך כתובת אם צריך
  useEffect(() => {
    if (!otherUserId && otherUserIdParam) {
      setOtherUserId(Number(otherUserIdParam));
    }
  }, [otherUserIdParam]);

  // 2. טוענת את השם והתמונה של המשתמש השני (גם אם אין הודעות עדיין)
  useEffect(() => {
    const fetchOtherUserInfo = async () => {
      if (otherUserId) {
        try {
          const resUser = await axios.get(`http://localhost:3000/users/${otherUserId}`);
          setOtherUserName(resUser.data.name);
          setOtherUserImage(resUser.data.image_url);
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      }
    };
    fetchOtherUserInfo();
  }, [otherUserId]);

  // 3. טוען הודעות
  useEffect(() => {
    fetchMessages();
  }, [donationId]);

  // 4. Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel("chat-listener")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `donation_id=eq.${donationId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          if (
            newMsg.from_user_id === currentUserId ||
            newMsg.to_user_id === currentUserId
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [donationId]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/messages/${donationId}?userId=${currentUserId}`
      );
      setMessages(res.data);

      // אם יש הודעות – נגזור מהן את המשתמש השני
      if (res.data.length > 0) {
        const first = res.data[0];
        const otherId =
          first.from_user_id === currentUserId
            ? first.to_user_id
            : first.from_user_id;
        setOtherUserId(otherId);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!otherUserId) {
      console.warn("Cannot send message – recipient not found");
      return;
    }

    try {
      await axios.post("http://localhost:3000/messages", {
        from_user_id: currentUserId,
        to_user_id: otherUserId,
        donation_id: donationId,
        text: newMessage,
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="p-4 max-w-[430px] mx-auto h-screen flex flex-col bg-gray-50">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-300">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <img
          src={otherUserImage || "/default-image.png"}
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="font-semibold text-gray-800">{otherUserName}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 p-2 rounded-lg max-w-[70%] ${
              msg.from_user_id === currentUserId
                ? "bg-[#DCF8C6] ml-auto text-right"
                : "bg-white text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex mt-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-[#6B9F9F] text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
