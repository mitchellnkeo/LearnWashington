import { WASHINGTON_BOUNDS } from "./enums";

export function isInsideWashington(latitude: number, longitude: number): boolean {
  return (
    longitude >= WASHINGTON_BOUNDS.west &&
    longitude <= WASHINGTON_BOUNDS.east &&
    latitude >= WASHINGTON_BOUNDS.south &&
    latitude <= WASHINGTON_BOUNDS.north
  );
}
