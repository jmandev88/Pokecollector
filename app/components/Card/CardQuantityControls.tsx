"use client";

import { useState, useTransition } from "react";

import {
  incrementCollection,
  decrementCollection,
} from "@/app/actions/collections.actions";

type Props = {
  variantId: string;
  quantity: number;
  variant?: "default" | "vault";
  canUpdate?: boolean;
  onAuthRequired?: () => void;
  onQuantityChange?: (quantity: number) => void;
};

export default function CardQuantityControls({
  variantId,
  quantity,
  variant = "default",
  canUpdate = true,
  onAuthRequired,
  onQuantityChange,
}: Props) {
  const [count, setCount] = useState(quantity);
  const [isPending, startTransition] = useTransition();
  const isVault = variant === "vault";

  const updateCount = (nextCount: number) => {
    setCount(nextCount);
    onQuantityChange?.(nextCount);
  };

  const guardAuthenticated = () => {
    if (canUpdate) {
      return true;
    }

    onAuthRequired?.();
    return false;
  };

  if (count === 0) {
    return (
      <button
        disabled={isPending}
        className={`block h-8 w-full cursor-pointer rounded px-3 text-xs font-black transition disabled:opacity-60 ${
          isVault
            ? "bg-[#2463a8] text-white hover:bg-[#1c4f86]"
            : "bg-green-400/75 text-white hover:bg-green-400/50"
        }`}
        onClick={() =>
          startTransition(async () => {
            if (!guardAuthenticated()) {
              return;
            }

            updateCount(1);

            try {
              await incrementCollection(variantId);
            } catch {
              updateCount(0);
            }
          })
        }
      >
        Add to Collection
      </button>
    );
  }

  return (
    <div
      className={`flex items-center justify-between overflow-hidden rounded ${
        isVault ? "border border-[#cad9ee] bg-white" : "gap-2 bg-white/15"
      }`}
    >
      <button
        disabled={isPending}
        className={`h-8 w-8 cursor-pointer disabled:opacity-35 ${
          isVault
            ? "bg-[#eef5ff] font-black text-[#2463a8] hover:bg-[#ddeafb]"
            : "rounded-bl rounded-tl bg-rose-500 hover:bg-rose-500/50"
        }`}
        onClick={() =>
          startTransition(async () => {
            if (!guardAuthenticated()) {
              return;
            }

            const nextCount = Math.max(count - 1, 0);
            updateCount(nextCount);

            try {
              await decrementCollection(variantId);
            } catch {
              updateCount(count);
            }
          })
        }
      >
        -
      </button>

      <div
        className={`min-w-8 text-center ${
          isVault ? "text-xs font-black text-[#2c1715]" : ""
        }`}
      >
        {count}
      </div>

      <button
        disabled={isPending}
        className={`h-8 w-8 cursor-pointer disabled:opacity-60 ${
          isVault
            ? "bg-[#2463a8] font-black text-white hover:bg-[#1c4f86]"
            : "rounded-br rounded-tr bg-green-400/75 hover:bg-green-400/50"
        }`}
        onClick={() =>
          startTransition(async () => {
            if (!guardAuthenticated()) {
              return;
            }

            const nextCount = count + 1;
            updateCount(nextCount);

            try {
              await incrementCollection(variantId);
            } catch {
              updateCount(count);
            }
          })
        }
      >
        +
      </button>
    </div>
  );
}
