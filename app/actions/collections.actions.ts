"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  addCardToCollection,
  removeCardFromCollection,
  fetchFullUserCollection,
  fetchCollectionSetStats
} from "@/db/mcc_user_collection/mcc_user_collection.repo";
import {
  addSealedToCollection,
  removeSealedFromCollection,
} from "@/db/mcc_user_sealed_collection/mcc_user_sealed_collection.repo";

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

export async function incrementSealedCollection(
  sealedId: string
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await addSealedToCollection(
    session.user.id,
    sealedId
  );
}

export async function decrementSealedCollection(
  sealedId: string
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await removeSealedFromCollection(
    session.user.id,
    sealedId
  );
}

export async function getFullUserCollection() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  return fetchFullUserCollection(
    session.user.id
  );
}
export async function getCollectionSetStats() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  return fetchCollectionSetStats(
    session.user.id
  );
}
