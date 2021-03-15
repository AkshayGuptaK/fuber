import autoBind from 'auto-bind';
import { Coordinate } from './types';
import { distanceBetween } from './utils';

export default class SortedArray<T> {
  private items: Array<{ coordinates: Coordinate; item: T }> = [];

  constructor() {
    autoBind(this);
  }

  /**
   * Inserts an item into the sorted array
   * @param itemX - horizontal coordinate of item to be inserted
   * @param itemY - vertical coordinate of item to be inserted
   * @param item - item to be inserted
   */
  add(itemX: number, itemY: number, item: T): void {
    this.items.push({
      coordinates: [itemX, itemY],
      item,
    });
  }

  /**
   * Remove and return the nearest item in the array that meets the filter criteria
   * @param targetX - horizontal coordinate to search near
   * @param targetY - vertical coordinate to search neer
   * @param filter - a function that takes an item and returns true if it meets the criteria
   * @returns closest matching item and its coordinates
   */
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
