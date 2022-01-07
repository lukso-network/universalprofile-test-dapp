export const sliceAddress = (address?: string | null, sliceBy = 6): string => {
  let sliceAddress = "";

  if (address) {
    sliceAddress = `${address.slice(0, sliceBy + 2)}...${address.slice(
      -sliceBy
    )}`;
  }

  return sliceAddress;
};
