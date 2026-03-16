import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          {
            "bg-brand-red text-white hover:bg-brand-red-dark shadow-lg hover:shadow-xl":
              variant === "primary",
            "bg-brand-yellow text-brand-dark hover:bg-amber-400 shadow-lg hover:shadow-xl":
              variant === "secondary",
            "border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-white":
              variant === "outline",
            "text-brand-dark hover:bg-black/5": variant === "ghost",
          },
          {
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
