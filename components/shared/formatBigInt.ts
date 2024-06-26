/**
 * Format a bigint to a string with fixed decimal places and commas.
 * @param {bigint} value - The bigint value to format.
 * @param {number} decimals - The number of decimal places to preserve in the result.
 * @returns {string} - The formatted string.
 */
export const formatBigIntToFixed = (value: bigint, decimals: number): string => {
  const divisor = BigInt(10 ** 6); // USDC has 6 decimal places
  const integerPart = value / divisor;
  const fractionalPart = Number((value % divisor).toString().padStart(6, '0'));

  const fixedFractionalPart = (fractionalPart / 10 ** 6).toFixed(decimals).split('.')[1];
  
  const formattedIntegerPart = integerPart.toLocaleString();

  return `${formattedIntegerPart}.${fixedFractionalPart}`;
};