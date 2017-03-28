exports.view = function() {
  const id = this.query.id;
  const product = this.productService.get(id);

  this.render({ id: product.id, name: product.name });
};
