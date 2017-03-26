module.exports = function() {
  return function* B() {
    this.body = this.body + ' & b';
  };
};

