import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function StyledButton({
  label,
  icon,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition";
  const variantStyle =
    variant === "primary"
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button className={`${baseStyle} ${variantStyle} ${className || ""}`} {...props}>
      {icon && <span>{icon}</span>}
      {label && <span>{label}</span>}
    </button>
  );
}