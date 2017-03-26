'use strict';


class Controller {
  getData() {
    this.render({ name: 'plover' });
  }
}

module.exports = new Controller();
