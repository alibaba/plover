const semver = require('semver');


/**
 * 验证模块依赖是否兼容
 *
 * @param {Map<name, info>}  modules - 模块列表
 */
module.exports = function(modules) {
  for (const info of modules.values()) {
    vertifyModule(modules, info);
  }
};


function vertifyModule(modules, info) {
  const dep = info.dep;
  if (!dep) {
    return;
  }

  for (const name in dep) {
    const dinfo = modules.get(name);
    if (!dinfo) {
      throw new Error(`the module ${name} which is required by ${info.name} can not be found.`);   // eslint-disable-line
    }
    const valid = semver.satisfies(dinfo.version, dep[name]);
    if (!valid) {
      throw new Error(`${name}@${dinfo.version} is not compatible with ${info.name} which depend on ${name}@${dep[name]}`);    // eslint-disable-line
    }
  }
}
