"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of skeleton items to render
   */
  count?: number;
  /**
   * Custom className for each skeleton item
   */
  itemClassName?: string;
  /**
   * Gap between skeleton items
   */
  gap?: "sm" | "md" | "lg";
}

/**
 * SkeletonShimmer - A loading skeleton with modern gradient shimmer animation
 *
 * Features:
 * - Smooth gradient shimmer effect using background-position animation
 * - Hardware-accelerated for better performance
 * - Subtle and elegant animation
 * - Respects prefers-reduced-motion for accessibility
 */
export function SkeletonShimmer({
  count = 3,
  itemClassName,
  gap = "md",
  className,
  ...props
}: SkeletonShimmerProps) {
  // Use space-y for vertical spacing (matching actual card layout)
  const gapClass = {
    sm: "space-y-2",
    md: "space-y-3",
    lg: "space-y-4",
  }[gap];

  return (
    <div className={cn(gapClass, className)} {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} className={itemClassName} />
      ))}
    </div>
  );
}

type SkeletonItemProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * SkeletonItem - Individual skeleton item with gradient shimmer effect
 *
 * Uses a linear gradient background that animates via background-position
 * for a smooth, modern shimmer effect. This approach is:
 * - More performant than transform-based animations
 * - Creates a smoother, more natural shimmer
 * - Hardware-accelerated by default
 *
 * Layout matches actual card items with px-4 py-3 padding
 */
export function SkeletonItem({ className, ...props }: SkeletonItemProps) {
  return (
    <div
      className={cn(
        // Base skeleton styles - gradient shimmer animation
        "skeleton-shimmer",
        // Base shape styles - matching actual card layout
        "flex items-center rounded-xl border border-border/40 px-4 py-3",
        // Default size - can be overridden
        "min-h-[64px]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * SkeletonText - Text-like skeleton with shimmer effect
 */
export function SkeletonText({ className, ...props }: SkeletonItemProps) {
  return (
    <div className={cn("skeleton-shimmer h-4 rounded", className)} {...props} />
  );
}

/**
 * SkeletonCircle - Circular skeleton for avatars
 */
export function SkeletonCircle({ className, ...props }: SkeletonItemProps) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-full", className)}
      {...props}
    />
  );
}
