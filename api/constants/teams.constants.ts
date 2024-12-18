import { Team } from "../types/teams.types";

export const TEAM_COLOR_MAPPING: Record<string, string> = {
  McLaren: "#FF8000",
  "Red Bull Racing": "#3671C6",
  Ferrari: "#E80020",
  Mercedes: "#27F4D2",
  "Aston Martin": "#229971",
  Haas: "#B6BABD",
  RB: "#6692FF",
  Williams: "#64C4FF",
  Alpine: "#0093CC",
  "Kick Sauber": "#000000",
} as const;

export const TEAM_PROPERTIES_TO_CHECK: (keyof Team)[] = [
  "name",
  "logo",
  "logoSmall",
  "imageCar",
  "drivers",
  "color",
];
