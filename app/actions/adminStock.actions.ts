"use server";

import {
  adjustCardStock,
  setCardStock,
  setCardStockPrice,
} from "@/db/mcc_card_stock/mcc_card_stock.repo";
import { ADMIN_USER_ID } from "@/app/config/admin";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

function homepagePathFor(path: string) {
  const [, lang] = path.split("/");

  return lang ? `/${lang}` : "/en";
}

async function assertAdmin() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id !== ADMIN_USER_ID) {
    throw new Error("Not authorized");
  }
}

export async function incrementCardStock(variantId: string, path: string) {
  await assertAdmin();
  await adjustCardStock(variantId, 1);
  revalidatePath(path);
  revalidatePath(homepagePathFor(path));
}

export async function decrementCardStock(variantId: string, path: string) {
  await assertAdmin();
  await adjustCardStock(variantId, -1);
  revalidatePath(path);
  revalidatePath(homepagePathFor(path));
}

export async function updateCardStock(formData: FormData) {
  await assertAdmin();

  const variantId = String(formData.get("variantId") ?? "");
  const path = String(formData.get("path") ?? "/en/admin/stock");
  const quantity = Number(formData.get("quantity") ?? 0);

  if (!variantId) {
    throw new Error("Missing variant id");
  }

  await setCardStock(variantId, Number.isFinite(quantity) ? quantity : 0);
  revalidatePath(path);
  revalidatePath(homepagePathFor(path));
}

export async function updateCardStockPrice(formData: FormData) {
  await assertAdmin();

  const variantId = String(formData.get("variantId") ?? "");
  const path = String(formData.get("path") ?? "/en/admin/stock");
  const price = String(formData.get("price") ?? "");

  if (!variantId) {
    throw new Error("Missing variant id");
  }

  await setCardStockPrice(variantId, price);
  revalidatePath(path);
  revalidatePath(homepagePathFor(path));
}
