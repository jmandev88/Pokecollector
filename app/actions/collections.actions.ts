"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import {
  addCardToCollection,
  removeCardFromCollection,
} from "@/db/mcc_user_collection/mcc_user_collection.repo";

export async function incrementCollection(
  variantId: string
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await addCardToCollection(
    session.user.id,
    variantId
  );
}

export async function decrementCollection(
  variantId: string
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await removeCardFromCollection(
    session.user.id,
    variantId
  );
}