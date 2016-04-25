'use strict';


exports.view = function() {
  const items = [
    {
      name: 'Javascript高级程序设计',
      price: 84.2
    },

    {
      name: 'Javascript语言精粹',
      price: 24.2
    }
  ];


  this.render({
    items: items,
    formatPrice: formatPrice
  });
};


exports.header = function() {
  const title = this.query.title;
  this.render({ title: title });
};


exports['view-not-found'] = function() {
  this.render();
};


exports.renderError = function() {
  throw new Error('some error happen');
};


exports.renderChildError = function() {
  this.render();
};


function formatPrice(v) {
  return v + '元';
}
