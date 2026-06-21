// app/utils/pokemon.ts

import pokemon from "@/app/utils/pokemon.json";

function toTitleCase(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getPokemonName(
  pokedexNumber: number | string
): string {
  const name =
    pokemon[String(pokedexNumber) as keyof typeof pokemon];

  return name ? toTitleCase(name) : "Unknown";
}