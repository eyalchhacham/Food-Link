import * as React from "react";

interface AlertProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "warning" | "error" | "success";
}

export const Alert: React.FC<AlertProps> = ({
  children,
  className = "",
  variant = "default",
}) => {
  const base = "w-full rounded-lg border p-4 text-sm";
  const variants = {
    default: "bg-gray-100 border-gray-300 text-gray-700",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
    error: "bg-red-50 border-red-300 text-red-800",
    success: "bg-green-50 border-green-300 text-green-800",
  };

  return (
    <div className={`${base} ${variants[variant] || ""} ${className}`}>
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className = "",
}) => {
  return <div className={`text-sm ${className}`}>{children}</div>;
};
