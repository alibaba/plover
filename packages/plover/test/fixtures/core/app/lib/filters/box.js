'use strict';


exports.afterRender = function() {
  const route = this.route;
  this.body =
`<div class="${route.module}-${route.action}">
  ${this.body}
</div>`;
};
