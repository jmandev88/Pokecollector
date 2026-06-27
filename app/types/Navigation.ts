export type NavTarget = "_self" | "_blank";

/** All navigable routes in the application. Add new routes here as they are implemented. */
export type NavLinks =
  | "/"
  | "/sets"
  | "/sealed"
  | "/price-browser"
  | "/performance"
  | "/illustrators"
  | "/elite-trainer-boxes"
  | "/boosters"
  | "/search"
  | "/wishlist"
  | "/scan-a-card";

export type NavLabels =
  | "Home"
  | "Sets"
  | "Sealed"
  | "Price Browser"
  | "Performance"
  | "Illustrators"
  | "Elite Trainer Boxes"
  | "Boosters"
  | "Search"
  | "Wishlist"
  | "Scan a Card";

export type NavImages =
  | "layout/home.svg"
  | "layout/sets.svg"
  | "layout/price-browser.svg"
  | "layout/performance.svg"
  | "layout/illustrators.svg"
  | "layout/elite-trainer-boxes.svg"
  | "layout/boosters.svg"
  | "layout/search.svg"
  | "layout/wishlist.svg"
  | "layout/scan-a-card.svg";

export interface NavItem {
  href: NavLinks;
  label: NavLabels;
  target?: NavTarget;
  image: NavImages;
}
