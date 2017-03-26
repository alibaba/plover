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


exports.panel = function() {
  const slowText = new Promise(resolve => {
    setTimeout(() => {
      resolve('slow text')
    }, 10);
  });
  this.render({ slowText: slowText });
};


exports.books = function* () {
  yield sleep(10);
  const data = {
    books: ['book a', 'book b', 'book c']
  };
  this.render(data);
};


exports.show = function* () {
  yield sleep(10);
  this.render();
}


exports['view-not-found'] = function() {
  this.render();
};


exports.renderChildError = function() {
  this.render();
};


exports.renderError = function() {
  throw new Error('some error happen');
};


exports.renderAsyncChildError = function() {
  this.render();
};

exports.renderAsyncError = function* () {
  yield sleep(10);
  throw new Error('some error happen');
};


exports['not-found'] = function* () {
  yield sleep(10);
  return false;
};


function formatPrice(v) {
  return v + '元';
}


function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}
