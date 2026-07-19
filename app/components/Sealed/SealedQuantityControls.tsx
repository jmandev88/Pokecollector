"use client";

import { useState, useTransition } from "react";

import {
  incrementSealedCollection,
  decrementSealedCollection,
} from "@/app/actions/collections.actions";

type Props = {
  sealedId: string;
  quantity: number;
  variant?: "default" | "vault";
};

export default function SealedQuantityControls({
  sealedId,
  quantity,
  variant = "default",
}: Props) {
  const [count, setCount] = useState(quantity);
  const [isPending, startTransition] = useTransition();
  const isVault = variant === "vault";

  if (count === 0) {
    return (
      <button
        disabled={isPending}
        className={`block h-8 w-full cursor-pointer rounded px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isVault
            ? "bg-[#cf160f] text-white hover:bg-[#a9110c]"
            : "bg-green-400/75 text-white hover:bg-green-400/50"
        }`}
        onClick={() =>
          startTransition(async () => {
            setCount(1);

            try {
              await incrementSealedCollection(sealedId);
            } catch {
              setCount(0);
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
        isVault ? "border border-[#efcbc4] bg-white" : "gap-2 bg-white/15"
      }`}
    >
      <button
        disabled={isPending}
        className={`h-8 w-8 cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 ${
          isVault
            ? "bg-[#fff2ef] font-black text-[#cf160f] hover:bg-[#ffe2dc]"
            : "rounded-bl rounded-tl bg-rose-500 hover:bg-rose-500/50"
        }`}
        onClick={() =>
          startTransition(async () => {
            setCount((current) => current - 1);

            try {
              await decrementSealedCollection(sealedId);
            } catch {
              setCount((current) => current + 1);
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
        className={`h-8 w-8 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
          isVault
            ? "bg-[#cf160f] font-black text-white hover:bg-[#a9110c]"
            : "rounded-br rounded-tr bg-green-400/75 hover:bg-green-400/50"
        }`}
        onClick={() =>
          startTransition(async () => {
            setCount((current) => current + 1);

            try {
              await incrementSealedCollection(sealedId);
            } catch {
              setCount((current) => current - 1);
            }
          })
        }
      >
        +
      </button>
    </div>
  );
}
