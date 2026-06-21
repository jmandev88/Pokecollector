// app/utils/pokemon.ts

import pokemon from "@/app/utils/pokemon.json";

export function getPokemonName(
  pokedexNumber: number | string
): string {
  return (
    pokemon[String(pokedexNumber) as keyof typeof pokemon] ??
    "Unknown"
  );
}