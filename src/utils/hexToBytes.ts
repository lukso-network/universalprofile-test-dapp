export const hexToBytes = (hex: string): string => {
  return parseInt(hex, 16).toString(2).padStart(8, "0");
};
