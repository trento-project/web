const isArray = function isArray(a) {
  return Array.isArray(a);
};

const isObject = function isObject(o) {
  return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

const toCamel = (s) => s.replace(/([-_][a-z])/gi, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));

export const keysToCamel = function keysToCamel(o) {
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

export const urlEncode = function urlEncode(params) {
  const str = [];
  Object.entries(params).forEach(([key, value]) => {
    str.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[value])}`);
  });
  return str.join('&');
};
