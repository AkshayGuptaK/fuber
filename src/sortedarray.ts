import autoBind from 'auto-bind';
import { Coordinate } from './types';
import { distanceBetween } from './utils';

export default class SortedArray<T> {
  private items: Array<{ coordinates: Coordinate; item: T }> = [];

  constructor() {
    autoBind(this);
  }

  add(itemX: number, itemY: number, item: T): void {
    this.items.push({
      coordinates: [itemX, itemY],
      item,
    });
  }

  removeNearest(
    targetX: number,
    targetY: number,
    filterFn: (item: T) => boolean
  ): { coordinates: Coordinate; item: T } | null {
    const sortFn = (a: Coordinate, b: Coordinate) =>
      this.getDistanceFrom(a, targetX, targetY) -
      this.getDistanceFrom(b, targetX, targetY);
    return (
      this.items
        .filter(({ item }) => filterFn(item))
        .sort(({ coordinates: a }, { coordinates: b }) => sortFn(a, b)) // could do a reduce and hence a transduce
        .shift() || null
    );
  }

  private getDistanceFrom(
    location: Coordinate,
    targetX: number,
    targetY: number
  ) {
    return distanceBetween(location, [targetX, targetY]);
  }
}
