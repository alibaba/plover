module.exports = function* A(next) {
  this.body = 'a';
  yield* next;
};
