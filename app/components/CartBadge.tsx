"use client";

export function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow">
      {count}
    </span>
  );
}
