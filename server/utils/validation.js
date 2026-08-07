exports.isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

exports.isPositiveNumber = (num) => {
  return typeof num === 'number' && num > 0;
};