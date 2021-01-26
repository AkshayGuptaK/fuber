import autoBind from 'auto-bind';
import { Coordinate } from './types';

const directions = ['NW', 'SW', 'NE', 'SE'] as const;
type Direction = typeof directions[number];

interface Best<T> {
  distance: number;
  node: Node<T>;
}

export default class QuadTree<T> {
  private root: Node<T>;

  constructor() {
    autoBind(this);
    this.root = null;
  }

  add(itemX: number, itemY: number, item: T): void {
    this.root = this.addToSubtree(itemX, itemY, item, new Bound(), this.root);
  }

  private addToSubtree(
    itemX: number,
    itemY: number,
    item: T,
    bound: Bound,
    node: Node<T>
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

  removeNearest(
    targetX: number,
    targetY: number,
    filter: (item: T) => boolean
  ): { coordinates: Coordinate; item: T } {
    let best: Best<T> = { distance: Number.POSITIVE_INFINITY, node: null };
    best = this.findNearestInSubtree(targetX, targetY, filter, best, this.root);
    if (best.node == null) return null;
    const item = best.node.getItem();
    const coordinates = best.node.getCoordinates();
    this.removeNode(best.node);
    return { coordinates, item };
  }

  private removeNode(node: Node<T>): void {
    node.removeItem();
  }

  private findNearestInSubtree(
    targetX,
    targetY,
    filter,
    best: Best<T>,
    node: Node<T>
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

  private findNearestInRestOfTree(
    targetX,
    targetY,
    filter,
    best,
    node: Node<T>,
    goodDirection
  ) {
    const otherDirections = directions.filter((d) => d !== goodDirection);
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

  private updateBestForNode(
    targetX,
    targetY,
    filter,
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
  public NW: Node<T>;
  public SW: Node<T>;
  public NE: Node<T>;
  public SE: Node<T>;

  constructor(
    private x: number,
    private y: number,
    private bound: Bound,
    private item: T
  ) {
    autoBind(this);
    this.NW = this.SW = this.NE = this.SE = null;
  }

  distanceTo(x: number, y: number): number {
    const xDistance = Math.abs(x - this.x);
    const yDistance = Math.abs(y - this.y);
    return Math.sqrt(xDistance ** 2 + yDistance ** 2);
  }

  directionTo(x: number, y: number): Direction {
    if (x >= this.x && y >= this.y) return 'NW';
    if (x >= this.x && y < this.y) return 'SE';
    if (x < this.x && y >= this.y) return 'NW';
    if (x < this.x && y < this.y) return 'SW';
  }

  limitBoundBy(dir: Direction): Bound {
    if (dir == 'NE') return this.bound.updateLimit(this.x, null, this.y, null);
    if (dir == 'NW') return this.bound.updateLimit(null, this.x, this.y, null);
    if (dir == 'SE') return this.bound.updateLimit(this.x, null, null, this.y);
    if (dir == 'SW') return this.bound.updateLimit(null, this.x, null, this.y);
  }

  getItem(): T {
    return this.item;
  }

  getCoordinates() {
    return { x: this.x, y: this.y };
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
    const xDistance = Math.abs(closestX - targetX);
    const yDistance = Math.abs(closestY - targetY);
    return Math.sqrt(xDistance ** 2 + yDistance ** 2);
  }
}
