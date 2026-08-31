export type GridSize = Readonly<{ x: number; y: number; z: number }>;

export function volume(size: GridSize): number {
  return size.x * size.y * size.z;
}

export function index3D(x: number, y: number, z: number, size: GridSize): number {
  return x + size.x * (y + size.y * z);
}

export function wrap(value: number, limit: number): number {
  return ((value % limit) + limit) % limit;
}

export function wrappedIndex3D(x: number, y: number, z: number, size: GridSize): number {
  return index3D(wrap(x, size.x), wrap(y, size.y), wrap(z, size.z), size);
}
