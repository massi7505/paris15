// components/ui/Badge.tsx
import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export default function Badge({ label, color = "#F59E0B", className }: BadgeProps) {
  return (
    <span
      className={cn("inline-block text-[10px] font-bold tracking-wide px-2.5 py-0.5 rounded-full text-white uppercase", className)}
      style={{ background: color }}
    >
      {label}
    </span>
  );
}
