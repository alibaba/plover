'use strict';


class UrlHelper {
  constructor(rd) {
    this.ctx = rd.ctx;
  }


  getOfferUrl(id) {
    return `http://${this.ctx.hostname}/offer/${id}`;
  }
}


module.exports = UrlHelper;
