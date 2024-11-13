import { Driver } from "../types/drivers.types";

export const DRIVER_PROPERTIES_TO_CHECK: (keyof Driver)[] = [
  "rank",
  "points",
  "team",
  "countryFlag",
  "image",
  "numberLogo",
];
