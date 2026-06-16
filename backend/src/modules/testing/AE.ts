function getDiffBits(h0: string, h1: string) {
  let diffBits = 0;
  for (let i = 0; i < h0.length; i++) {
    const v1 = parseInt(h0[i], 16);
    const v2 = parseInt(h1[i], 16);

    const xor = v1 ^ v2;

    diffBits +=
      (xor & 1) + ((xor >> 1) & 1) + ((xor >> 2) & 1) + ((xor >> 3) & 1);
  }
  const totalBits = h0.length * 4;
  const percentage = (diffBits / totalBits) * 100;

  return {
    diffBits,
    totalBits,
    percentage,
    fixPercentage: percentage.toFixed(2),
  };
}

export default getDiffBits;
