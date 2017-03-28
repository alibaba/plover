module.exports = function(prefix, list) {
  const results = [];
  let now = '';
  for (const url of list) {
    if (now !== '') {
      now += ',';
    }
    now += url;
    if (now.length > 1500) {
      results.push(prefix + now);
      now = '';
    }
  }

  if (now) {
    results.push(prefix + now);
  }

  return results;
};

