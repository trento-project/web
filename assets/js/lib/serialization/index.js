const isArray = function (a) {
  return Array.isArray(a);
};

const isObject = function (o) {
  return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

const toCamel = (s) => s.replace(/([-_][a-z])/gi, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));

export const keysToCamel = function (o) {
  if (isObject(o)) {
    const n = {};

    Object.keys(o).forEach((k) => {
      n[toCamel(k)] = keysToCamel(o[k]);
    });

    return n;
  } if (isArray(o)) {
    return o.map((i) => keysToCamel(i));
  }

  return o;
};

export const urlEncode = function (params) {
  const str = [];
  for (const p in params) str.push(`${encodeURIComponent(p)}=${encodeURIComponent(params[p])}`);
  return str.join('&');
};
