const formatCount = (num: number): string =>
  new Intl.NumberFormat("en-GB").format(num);

export default formatCount;