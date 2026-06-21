"use client";

import { useState, useTransition } from "react";

import {
  incrementCollection,
  decrementCollection,
} from "@/app/actions/collections.actions";

type Props = {
  variantId: string;
  quantity: number;
};

export default function CardQuantityControls({
  variantId,
  quantity,
}: Props) {
  const [count, setCount] = useState(quantity);
  const [isPending, startTransition] = useTransition();

  if (count === 0) {
    return (
      <button
        disabled={isPending}
        className="rounded bg-green-400/75 h-8 hover:bg-green-400/50 px-3 text-sm font-medium text-white block w-full cursor-pointer"
        onClick={() =>
          startTransition(async () => {
            setCount(1);

            try {
              await incrementCollection(variantId);
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
    <div className="flex items-center gap-2 justify-between bg-white/15 rounded">
      <button
        disabled={isPending}
        className="h-8 w-8 bg-rose-500 rounded-bl rounded-tl hover:bg-rose-500/50 cursor-pointer"
        onClick={() =>
          startTransition(async () => {
            setCount((current) => current - 1);

            try {
              await decrementCollection(variantId);
            } catch {
              setCount((current) => current + 1);
            }
          })
        }
      >
        -
      </button>

      <div className="min-w-8 text-center">
        {count}
      </div>

      <button
        disabled={isPending}
        className="h-8 w-8 rounded-tr rounded-br bg-green-400/75 h-8 hover:bg-green-400/50 cursor-pointer"
        onClick={() =>
          startTransition(async () => {
            setCount((current) => current + 1);

            try {
              await incrementCollection(variantId);
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