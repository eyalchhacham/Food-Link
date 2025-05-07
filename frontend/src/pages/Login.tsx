import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google"; // צריך להתקין npm install @react-oauth/google
import { User } from "../App";
import logo from "../logo.png";

export default function Login({ setUser }: { setUser: (user: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      setUser(data.user);

      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // התחברות עם גוגל
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch("http://localhost:3000/login/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Google login failed");
        }

        setUser(data.user);
        navigate("/home");
      } catch (error) {
        console.error(error);
        setError("Google login failed");
      }
    },
    onError: (error) => {
      console.error(error);
      setError("Google login failed");
    },
  });

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-white flex items-center justify-center">
      <div className="w-full h-[874px] bg-[#e8e2d8] shadow-lg rounded-3xl p-6 flex flex-col items-center">
        <img
          src={logo}
          alt="FoodLink Logo"
          className="w-40 h-40 object-contain mt-6"
        />
  
        <h1 className="text-3xl font-bold text-[#2c7063] mt-4">FoodLink</h1>
        <Link to="/signup" className="font-semibold text-[#2c7063] hover:underline">
          create an account
        </Link>
        <p className="text-sm text-[#368f89] mt-1 mb-4 text-center">
          Enter your email to sign up for this app
        </p>
  
        
<form onSubmit={handleSubmit} className="w-full px-4 flex flex-col gap-3">
  {error && (
    <div className="text-red-500 text-sm text-center mb-2">
      {error}
    </div>
  )}
  <input
    type="email"
    id="email"
    name="email"
    placeholder="user_name@ac.il"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2c7063]"
  />

  <input
    type="password"
    id="password"
    name="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2c7063]"
  />

  <button
    type="submit"
    disabled={isLoading}
    className="w-full bg-[#5d9b94] hover:bg-[#4b867e] text-white py-2 rounded-md font-medium"
  >
    {isLoading ? "Signing up..." : "Sign in with email"}
  </button>
</form>


  
        <div className="flex items-center my-4 w-full px-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-sm text-gray-600">or continue with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
  
        <button
          onClick={() => loginWithGoogle()}
          className="w-[85%] flex justify-center items-center py-2 border border-gray-300 rounded-md bg-white text-black text-sm font-medium"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Google
        </button>
  
        <p className="text-xs text-center text-gray-600 mt-4 px-6">
          By clicking continue, you agree to our{" "}
          <span className="font-semibold">Terms of Service</span> and{" "}
          <span className="font-semibold">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}