exports.getUrlParams = function (req) {
  const q = req.url.split('?');

  let url = q[0];

  const params = {};
  if (q.length >= 2) {
    q[1].split('&').forEach((item) => {
      try {
        params[item.split('=')[0]] = item.split('=')[1];
      } catch (e) {
        params[item.split('=')[0]] = '';
      }
    });
  }

  if (url[url.length - 1] === '/' && url.length > 1) {
    url = url.split('');
    url.pop();
    url = url.join('');
  }
  return { params, url };
};
