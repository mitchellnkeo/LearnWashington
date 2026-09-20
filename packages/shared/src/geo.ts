import { WASHINGTON_BOUNDS } from "./enums";

export function isInsideWashington(latitude: number, longitude: number): boolean {
  return (
    longitude >= WASHINGTON_BOUNDS.west &&
    longitude <= WASHINGTON_BOUNDS.east &&
    latitude >= WASHINGTON_BOUNDS.south &&
    latitude <= WASHINGTON_BOUNDS.north
  );
}

export function walkPositions(
  coordinates: unknown,
  visit: (longitude: number, latitude: number) => void,
): void {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return;
  }

  if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
    visit(coordinates[0], coordinates[1]);
    return;
  }

  for (const child of coordinates) {
    walkPositions(child, visit);
  }
}
