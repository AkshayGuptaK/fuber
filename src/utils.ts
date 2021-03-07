import { Coordinate } from './types';

export function distanceBetween(p1: Coordinate, p2: Coordinate): number {
  return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}
