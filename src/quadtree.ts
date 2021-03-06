import autoBind from 'auto-bind';
import { Coordinate } from './types';
import { distanceBetween } from './utils';

const directions = ['NW', 'SW', 'NE', 'SE'] as const;
type Direction = typeof directions[number];

interface Best<T> {
  distance: number;
  node: Node<T> | null;
}
/**
 * Quadtree data structure with filtered search
 * @remarks A four degree tree, where each child is one of four directions (NW, SW, NE, SE) from its parent.
 * Can insert items and return the nearest item to a given location that matches some filter criteria in O(log N) time.
 * @typeparam T - the type of items the tree contains
 */
export default class QuadTree<T> {
  private root: Node<T> | null;

  constructor() {
    autoBind(this);
    this.root = null;
  }

  /**
   * Inserts an item into the quadtree
   * @param itemX - horizontal coordinate of item to be inserted
   * @param itemY - vertical coordinate of item to be inserted
   * @param item - item to be inserted
   */
  add(itemX: number, itemY: number, item: T): void {
    this.root = this.addToSubtree(itemX, itemY, item, new Bound(), this.root);
  }

  /**
   * Remove and return the nearest item in the tree that meets the filter criteria
   * @param targetX - horizontal coordinate to search near
   * @param targetY - vertical coordinate to search near
   * @param filter - a function that takes an item and returns true if it meets the criteria
   * @returns closest matching item and its coordinates
   */
  removeNearest(
    targetX: number,
    targetY: number,
    filter: (item: T | null) => boolean
  ): { coordinates: Coordinate; item: T | null } | null {
    let best: Best<T> = { distance: Number.POSITIVE_INFINITY, node: null };
    best = this.findNearestInSubtree(targetX, targetY, filter, best, this.root);
    if (best.node == null) return null;
    const item = best.node.getItem();
    const coordinates = best.node.getCoordinates();
    this.removeNode(best.node);
    return { coordinates, item };
  }

  /**
   * Inserts an item into the subtree rooted at a given node
   * @param itemX - horizontal coordinate of item to be inserted
   * @param itemY - vertical coordinate of item to be inserted
   * @param item - item to be inserted
   * @param bound - tbd
   * @param node - the root node of the subtree
   * @returns the root node of the modified subtree after insertion
   */
  private addToSubtree(
    itemX: number,
    itemY: number,
    item: T,
    bound: Bound,
    node: Node<T> | null
  ): Node<T> {
    if (node == null) return new Node(itemX, itemY, bound, item);
    const direction = node.directionTo(itemX, itemY);
    node[direction] = this.addToSubtree(
      itemX,
      itemY,
      item,
      node.limitBoundBy(direction),
      node[direction]
    );
    return node;
  }

  private removeNode(node: Node<T>): void {
    node.removeItem();
    // check if leaf, if so remove node, recurse up the tree checking parents for the same
  }

  /**
   * Finds the nearest item in the subtree rooted at a given node matching the filter
   * @param targetX - horizontal coordinate to search near
   * @param targetY - vertical coordinate to search near
   * @param filter - function that takes an item and returns true if it meets the criteria
   * @param best - the closest matching node found so far and its distance from the target
   * @param node - the root node of the subtree
   * @returns the closest matching node and its distance from the target coordinates
   */
  private findNearestInSubtree(
    targetX: number,
    targetY: number,
    filter: (item: T | null) => boolean,
    best: Best<T>,
    node: Node<T> | null
  ): Best<T> {
    if (node == null) return best;
    const direction = node.directionTo(targetX, targetY);
    const goodSide = node[direction];
    best = this.findNearestInSubtree(targetX, targetY, filter, best, goodSide);
    best = this.updateBestForNode(targetX, targetY, filter, best, node);
    best = this.findNearestInRestOfTree(
      targetX,
      targetY,
      filter,
      best,
      node,
      direction
    );
    return best;
  }

  /**
   * Finds the nearest item in all other branches of the subtree except the one specified rooted at a given node matching the filter
   * @param targetX - horizontal coordinate to search near
   * @param targetY - vertical coordinate to search near
   * @param filter - function that takes an item and returns true if it meets the criteria
   * @param best - the closest matching node found so far and its distance from the target
   * @param node - the root node of the subtree
   * @param searchedDirection - the direction from the node to avoid searching as it's already searched
   * @returns the closest matching node and its distance from the target coordinates
   */
  private findNearestInRestOfTree(
    targetX: number,
    targetY: number,
    filter: (item: T | null) => boolean,
    best: Best<T>,
    node: Node<T>,
    searchedDirection: Direction
  ): Best<T> {
    const otherDirections = directions.filter((d) => d !== searchedDirection);
    for (const direction of otherDirections) {
      if (
        best.distance >
        node.limitBoundBy(direction).closestPossibleDistance(targetX, targetY)
      ) {
        best = this.findNearestInSubtree(
          targetX,
          targetY,
          filter,
          best,
          node[direction]
        );
      }
    }
    return best;
  }

  /**
   * Returns the new closest node and distance after considering a candidate node
   * @param targetX - horizontal coordinate to search near
   * @param targetY - vertical coordinate to search near
   * @param filter - function that takes an item and returns true if it meets the criteria
   * @param best - the closest matching node found so far and its distance from the target
   * @param node - candidate node for new closest
   * @returns the updated closest matching node and its distance from the target coordinates
   */
  private updateBestForNode(
    targetX: number,
    targetY: number,
    filter: (item: T | null) => boolean,
    best: Best<T>,
    node: Node<T>
  ): Best<T> {
    if (!filter(node.getItem())) return best;
    const distanceToTarget = node.distanceTo(targetX, targetY);
    if (distanceToTarget >= best.distance) return best;
    return {
      distance: distanceToTarget,
      node: node,
    };
  }
}

class Node<T> {
  public NW: Node<T> | null;
  public SW: Node<T> | null;
  public NE: Node<T> | null;
  public SE: Node<T> | null;

  constructor(
    private x: number,
    private y: number,
    private bound: Bound,
    private item: T | null
  ) {
    autoBind(this);
    this.NW = this.SW = this.NE = this.SE = null;
  }

  isLeaf(): boolean {
    return (this.NW || this.SW || this.NE || this.SE) == null;
  }

  distanceTo(x: number, y: number): number {
    return distanceBetween([x, y], [this.x, this.y]);
  }

  directionTo(x: number, y: number): Direction {
    if (x < this.x) {
      if (y < this.y) return 'SW';
      return 'NW';
    }
    if (y < this.y) return 'SE';
    return 'NE';
  }

  limitBoundBy(dir: Direction): Bound {
    switch (dir) {
      case 'NE':
        return this.bound.updateLimit(this.x, null, this.y, null);
      case 'NW':
        return this.bound.updateLimit(null, this.x, this.y, null);
      case 'SE':
        return this.bound.updateLimit(this.x, null, null, this.y);
      case 'SW':
        return this.bound.updateLimit(null, this.x, null, this.y);
    }
  }

  getItem(): T | null {
    return this.item;
  }

  getCoordinates(): Coordinate {
    return [this.x, this.y];
  }

  removeItem(): void {
    this.item = null;
  }
}

class Bound {
  constructor(
    private xMin = Number.NEGATIVE_INFINITY,
    private xMax = Number.POSITIVE_INFINITY,
    private yMin = Number.NEGATIVE_INFINITY,
    private yMax = Number.POSITIVE_INFINITY
  ) {
    autoBind(this);
  }

  updateLimit(
    xMin: number | null,
    xMax: number | null,
    yMin: number | null,
    yMax: number | null
  ): Bound {
    return new Bound(
      this.calcLimit('min', this.xMin, xMin),
      this.calcLimit('max', this.xMax, xMax),
      this.calcLimit('min', this.yMin, yMin),
      this.calcLimit('max', this.yMax, yMax)
    );
  }

  private calcLimit(limit: 'min' | 'max', a: number, b: number | null) {
    if (b == null) return a;
    if (limit == 'min') return Math.max(a, b);
    if (limit == 'max') return Math.min(a, b);
  }

  closestPossibleDistance(targetX: number, targetY: number): number {
    const closestX = Math.min(Math.max(this.xMin, targetX), this.xMax);
    const closestY = Math.min(Math.max(this.yMin, targetY), this.xMax);
    return distanceBetween([closestX, closestY], [targetX, targetY]);
  }
}
