'use strict';


exports.afterRender = function() {
  const route = this.route;
  this.content =
`<div class="${route.module}-${route.action}">
  ${this.content}
</div>`;
};
