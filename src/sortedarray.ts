import autoBind from 'auto-bind';
import { Coordinate } from './types';

export default class SortedArray<T> {
  private items: Array<{ coordinates: Coordinate; item: T }> = [];

  constructor() {
    autoBind(this);
  }

  add(itemX: number, itemY: number, item: T): void {
    this.items.push({
      coordinates: {
        x: itemX,
        y: itemY,
      },
      item,
    });
  }

  removeNearest(
    targetX: number,
    targetY: number,
    filterFn: (item: T) => boolean
  ): { coordinates: Coordinate; item: T } {
    const sortFn = (a, b) =>
      this.getDistanceFrom(a.coordinates, targetX, targetY) -
      this.getDistanceFrom(b.coordinates, targetX, targetY);
    return this.items
      .filter(({ item }) => filterFn(item))
      .sort(sortFn)
      .shift();
  }

  private getDistanceFrom(location, targetX, targetY) {
    return Math.sqrt((location.x - targetX) ** 2 + (location.y - targetY));
  }
}
