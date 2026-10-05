import { LIMITS } from "./config";
import { meetsTarget } from "./numbers";
export type Candidate<T> = { value: T; size: number; quality: number };
/** Samples the whole range first, then refines above the highest feasible sample.
 * All candidates are retained; a smaller result at higher quality is never discarded. */
export async function searchQuality<T>(
  encode: (quality: number) => Promise<{ value: T; size: number }>,
  target: number,
  check: () => void = () => {},
) {
  const candidates: Candidate<T>[] = [];
  const evaluate = async (quality: number) => {
    check();
    const result = await encode(quality);
    check();
    candidates.push({ ...result, quality });
  };
  const count = 7;
  for (let i = 0; i < count; i++) {
    await evaluate(
      LIMITS.maxQuality -
        ((LIMITS.maxQuality - LIMITS.minQuality) * i) / (count - 1),
    );
    if (i === 0 && meetsTarget(candidates[0].size, target)) break;
  }
  let feasible = candidates
    .filter((c) => meetsTarget(c.size, target))
    .sort((a, b) => b.quality - a.quality)[0];
  if (feasible && feasible.quality < LIMITS.maxQuality) {
    let low = feasible.quality;
    let high = Math.min(
      ...candidates.filter((c) => c.quality > low).map((c) => c.quality),
    );
    while (candidates.length < LIMITS.qualityAttempts && high - low > 0.004) {
      const q = (low + high) / 2;
      await evaluate(q);
      if (meetsTarget(candidates.at(-1)!.size, target)) low = q;
      else high = q;
    }
    feasible = candidates
      .filter((c) => meetsTarget(c.size, target))
      .sort((a, b) => b.quality - a.quality)[0];
  }
  const smallest = candidates.reduce((a, b) => (b.size < a.size ? b : a));
  return {
    best: feasible ?? smallest,
    smallest,
    reached: !!feasible,
    attempts: candidates.length,
  };
}
