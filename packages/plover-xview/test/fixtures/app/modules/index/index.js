exports.view = ctx => {
  ctx.render();
};


exports.coverage = ctx => {
  ctx.layout = false;
  ctx.render();
};
