import type { NavItem } from "@/app/types/Navigation";

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", target: "_self", image: "layout/home.svg" },
  { href: "/sets", label: "Sets", target: "_self", image: "layout/sets.svg" },
  { href: "/sealed", label: "Sealed", target: "_self", image: "layout/boosters.svg" },
  // { href: "/price-browser", label: "Price Browser", target: "_self", image: "layout/sets.svg" },
  // { href: "/illustrators", label: "Illustrators", target: "_self", image: "layout/illustrators.svg" },
  // { href: "/elite-trainer-boxes", label: "Elite Trainer Boxes", target: "_self", image: "layout/elite-trainer-boxes.svg" },
  // { href: "/boosters", label: "Boosters", target: "_self", image: "layout/boosters.svg" },
  // { href: "/search", label: "Search", target: "_self", image: "layout/search.svg" },
  // { href: "/wishlist", label: "Wishlist", target: "_self", image: "layout/wishlist.svg" },
  // { href: "/scan-a-card", label: "Scan a Card", target: "_self", image: "layout/scan-a-card.svg" },
] as const;
