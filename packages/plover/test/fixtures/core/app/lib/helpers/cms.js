'use strict';


class CMSHelper {
  constructor(rd, viewRender) {
    this.rd = rd;
    this.viewRender = viewRender;
  }

  render(url) {
    const defer = new Promise(function(resolve) {
      setTimeout(function() {
        resolve({ content: 'cms: ' + url });
      }, 100);
    });
    return this.viewRender.renderAsync(this.rd, defer, url);
  }
}


module.exports = CMSHelper;

