export function calculateMAD(data, k = 3.0) {
  const values = data.map((d) => d.value).sort((a, b) => a - b);
  const median =
    values.length % 2 === 0
      ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
      : values[Math.floor(values.length / 2)];
  const deviations = values.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
  const mad =
    deviations.length % 2 === 0
      ? (deviations[deviations.length / 2 - 1] + deviations[deviations.length / 2]) / 2
      : deviations[Math.floor(deviations.length / 2)];
  const upperBound = median + k * mad;
  const lowerBound = Math.max(0, median - k * mad);
  return {
    median, mad, upperBound, lowerBound, k,
    points: data.map((d) => ({
      ...d,
      isAnomaly: d.value > upperBound || d.value < lowerBound,
    })),
  };
}

export function adjustKFactor(current, falsePositive) {
  return falsePositive
    ? Math.min(5, Math.round((current + 0.2) * 10) / 10)
    : Math.max(2, Math.round((current - 0.1) * 10) / 10);
}

export function recursiveGapSplit(amounts, gapMult = 2.5, minGapAbs = 30, minSize = 5) {
  if (amounts.length < 2 * minSize) return [amounts.reduce((a, b) => a + b, 0) / amounts.length];
  const sorted = [...amounts].sort((a, b) => a - b);
  const diffs = sorted.slice(1).map((v, i) => v - sorted[i]);
  const ds = [...diffs].sort((a, b) => a - b);
  const median = ds[Math.floor(ds.length / 2)];
  if (median === 0) {
    const maxGap = Math.max(...diffs);
    if (maxGap > minGapAbs) {
      const idx = diffs.indexOf(maxGap) + 1;
      const left = sorted.slice(0, idx);
      const right = sorted.slice(idx);
      if (left.length >= minSize && right.length >= minSize) {
        return [
          left.reduce((a, b) => a + b, 0) / left.length,
          right.reduce((a, b) => a + b, 0) / right.length,
        ];
      }
    }
    return [sorted.reduce((a, b) => a + b, 0) / sorted.length];
  }
  const maxGap = Math.max(...diffs);
  if (maxGap > gapMult * median && maxGap > minGapAbs) {
    const idx = diffs.indexOf(maxGap) + 1;
    return [
      ...recursiveGapSplit(sorted.slice(0, idx), gapMult, minGapAbs, minSize),
      ...recursiveGapSplit(sorted.slice(idx), gapMult, minGapAbs, minSize),
    ];
  }
  return [sorted.reduce((a, b) => a + b, 0) / sorted.length];
}

export function assignCluster(amount, means) {
  return means.reduce(
    (best, m, i) => (Math.abs(amount - m) < Math.abs(amount - means[best]) ? i : best),
    0,
  );
}

export function detectGapDetails(amounts, gapMult = 3.0, minGapAbs = 20) {
  if (amounts.length < 10) return null;
  const sorted = [...amounts].sort((a, b) => a - b);
  const diffs = sorted.slice(1).map((v, i) => v - sorted[i]);
  const median = [...diffs].sort((a, b) => a - b)[Math.floor(diffs.length / 2)];
  const maxGap = Math.max(...diffs);
  if ((median === 0 ? maxGap > minGapAbs : maxGap > gapMult * median && maxGap > minGapAbs)) {
    const idx = diffs.indexOf(maxGap) + 1;
    const left = sorted.slice(0, idx),
      right = sorted.slice(idx);
    return {
      gapEuros: Math.round(maxGap),
      leftMean: Math.round(left.reduce((a, b) => a + b, 0) / left.length),
      rightMean: Math.round(right.reduce((a, b) => a + b, 0) / right.length),
      leftCount: left.length,
      rightCount: right.length,
    };
  }
  return null;
}
