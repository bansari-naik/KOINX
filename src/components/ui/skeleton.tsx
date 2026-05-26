import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-[shimmer_1.8s_linear_infinite] rounded-xl bg-[linear-gradient(110deg,rgba(255,255,255,0.05),rgba(255,255,255,0.1),rgba(255,255,255,0.05))] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}
