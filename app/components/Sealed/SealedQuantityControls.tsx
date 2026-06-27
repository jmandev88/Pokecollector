"use client";

import { useState, useTransition } from "react";

import {
  incrementSealedCollection,
  decrementSealedCollection,
} from "@/app/actions/collections.actions";

type Props = {
  sealedId: string;
  quantity: number;
};

export default function SealedQuantityControls({
  sealedId,
  quantity,
}: Props) {
  const [count, setCount] = useState(quantity);
  const [isPending, startTransition] = useTransition();

  if (count === 0) {
    return (
      <button
        disabled={isPending}
        className="block h-8 w-full cursor-pointer rounded bg-green-400/75 px-3 text-sm font-medium text-white hover:bg-green-400/50 disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="flex items-center justify-between gap-2 rounded bg-white/15">
      <button
        disabled={isPending}
        className="h-8 w-8 cursor-pointer rounded-bl rounded-tl bg-rose-500 hover:bg-rose-500/50 disabled:cursor-not-allowed disabled:opacity-50"
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

      <div className="min-w-8 text-center">{count}</div>

      <button
        disabled={isPending}
        className="h-8 w-8 cursor-pointer rounded-br rounded-tr bg-green-400/75 hover:bg-green-400/50 disabled:cursor-not-allowed disabled:opacity-50"
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
