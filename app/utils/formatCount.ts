const formatCount = (num) => {
  return new Intl.NumberFormat('en-GB').format(num);
};

export default formatCount;