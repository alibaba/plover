'use strict';


class ProductService {
  constructor(ctx) {
    this.ctx = ctx;
  }


  get(id) {
    const code = this.ctx.codeService.generate();
    return {
      id: id,
      name: `product-${id}`,
      code: code
    };
  }
}


module.exports = ProductService;
