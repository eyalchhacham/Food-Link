import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

const cn = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "ghost";
  size?: "default" | "sm" | "icon";
}

const buttonBaseClasses =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  default: "bg-teal-600 text-white hover:bg-teal-700",
  ghost: "bg-transparent hover:bg-teal-100 text-teal-700",
};

const sizes = {
  default: "h-10 px-4",
  sm: "h-8 px-3 text-sm",
  icon: "h-8 w-8",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonBaseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
