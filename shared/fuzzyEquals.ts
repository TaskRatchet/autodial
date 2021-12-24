export default function fuzzyEquals(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-12;
}
