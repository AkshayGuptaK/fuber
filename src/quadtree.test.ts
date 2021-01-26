import QuadTree from './quadtree';

function noFilter(_: string) {
  return true;
}

function basicFilter(item: string) {
  if (item == null) return false;
  return true;
}

function complexFilter(item: string) {
  if (item == null || item.endsWith('2')) return false;
  return true;
}

describe('Quad Tree', () => {
  it('should return null when removing nearest from an empty tree', () => {
    const qt = new QuadTree();
    expect(qt.removeNearest(0, 0, basicFilter)).toBeNull();
  });

  it('should return added item when removing nearest from tree with one item', () => {
    const qt = new QuadTree();
    qt.add(0, 0, 'item');
    expect(qt.removeNearest(0, 0, basicFilter)).toEqual('item');
  });

  it('should return closest item when removing nearest from tree with no filter', () => {
    const qt = new QuadTree();
    qt.add(0, 0, 'item1');
    qt.add(1, 4, 'item2');
    qt.add(-3, 1, 'item3');
    qt.add(-2, -6, 'item4');
    qt.add(5, -1, 'item5');
    qt.add(-2, 4, null);
    expect(qt.removeNearest(-1, 4, noFilter)).toBeNull();
  });

  it('should return closest existing item when removing nearest from tree with basic filter', () => {
    const qt = new QuadTree();
    qt.add(0, 0, 'item1');
    qt.add(1, 4, 'item2');
    qt.add(-3, 1, 'item3');
    qt.add(-2, -6, 'item4');
    qt.add(5, -1, 'item5');
    qt.add(-2, 4, null);
    expect(qt.removeNearest(-1, 4, basicFilter)).toEqual('item2');
  });

  it('should return closest matching item when removing nearest from tree with complex filter', () => {
    const qt = new QuadTree();
    qt.add(0, 0, 'item1');
    qt.add(1, 4, 'item2');
    qt.add(-3, 1, 'item3');
    qt.add(-2, -6, 'item4');
    qt.add(5, -1, 'item5');
    qt.add(-2, 4, null);
    expect(qt.removeNearest(-1, 4, complexFilter)).toEqual('item3');
  });

  it('should return next closest existing item when removing nearest from tree a second time', () => {
    const qt = new QuadTree();
    qt.add(0, 0, 'item1');
    qt.add(1, 4, 'item2');
    qt.add(-3, 1, 'item3');
    qt.add(-2, -6, 'item4');
    qt.add(5, -1, 'item5');
    qt.add(-2, 4, null);
    expect(qt.removeNearest(-1, 4, basicFilter)).toEqual('item2');
    expect(qt.removeNearest(-1, 4, basicFilter)).toEqual('item3');
  });
});
