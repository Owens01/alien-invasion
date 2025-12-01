import {Rect} from "../types/types"

export function detectCollisions(
  a: Rect,
  b: Rect
): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
