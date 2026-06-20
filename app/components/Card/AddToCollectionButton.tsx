// app/components/Card/AddToCollectionButton.tsx

"use client";

import { useTransition } from "react";
import { incrementCollection } from "@/app/actions/collections.actions";

type Props = {
  variantId: string;
  session?: object | null;
};

export default function AddToCollectionButton({
  variantId,
    session = null,
}: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
     onClick={() =>
  startTransition(async () => {
    await incrementCollection(variantId);
  })
}
    >
      {isPending ? "Adding..." : "Add to Collection"}
    </button>
  );
}