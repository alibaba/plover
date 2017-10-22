

/**
 * push src中的所有项到des
 * @param {Array} des   - 目标数组
 * @param {Array} src   - 需要合并的数组
 * @return {Array}      - 目标数组
 */
exports.pushAll = function(des, src) {
  if (!src || !src.length) {
    return des;
  }

  for (const item of src) {
    des.push(item);
  }

  return des;
};
