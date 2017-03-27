module.exports = function() {
  return function* () {
    this.body = this.body + ' & d';
  };
};
