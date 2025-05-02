import React from "react";

export default function Spinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative w-8 h-8">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className="absolute block w-1 h-2.5 bg-gray-500 rounded-full opacity-10"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 45}deg) translate(0, -110%)`,
              transformOrigin: "center",
              animation: "fadeSpinner 0.8s linear infinite",
              animationDelay: `${(i * 0.1).toFixed(1)}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeSpinner {
          0%   { opacity: 1; }
          100% { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}
