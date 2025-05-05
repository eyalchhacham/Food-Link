import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "../App";
import logo from "../logo.png";

export default function Signup({ setUser }: { setUser: (user: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    //email valisation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|co\.il|org|net|edu|gov|info)$/;
    if (!emailRegex.test(email)) {
    setError("Please enter a valid email address");
    return;
    }
    //password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    //phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
    setError("Please enter a valid phone number (10 digits)");
    return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
       throw new Error(data.message || "Registration failed");
     }
      setUser({ email, name, phoneNumber, id: data.id });
      navigate("/home");
    } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-white flex items-center justify-center">
      <div className="w-full h-[874px] bg-[#e8e2d8] shadow-lg rounded-3xl p-6 flex flex-col items-center">
        <img
          src={logo}
          alt="FoodLink Logo"
          className="w-40 h-40 object-contain mt-6"
        />
  
        <h1 className="text-3xl font-bold text-[#2c7063] mt-4">FoodLink</h1>
        <p className="text-lg font-semibold text-[#2c7063]">Create your account</p>
        <p className="text-sm text-[#368f89] mt-1 mb-4 text-center">
          Already have an account?{" "}
          <Link to="/" className="font-medium underline text-[#2c7063]">
            Sign in
          </Link>
        </p>
        {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded w-full text-center">
        {error}
        </div>
        )}
        <form onSubmit={handleSubmit} className="w-full px-4 flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2c7063]"
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2c7063]"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2c7063]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2c7063]"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2c7063]"
          />
  
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2c7063] hover:bg-[#245b50] text-white py-2 rounded-md font-medium"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
  
        <p className="text-xs text-center text-gray-600 mt-4 px-6">
          By signing up, you agree to our{" "}
          <span className="font-semibold">Terms of Service</span> and{" "}
          <span className="font-semibold">Privacy Policy</span>
        </p>
      </div>
    </div>
  );  
}