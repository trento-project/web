export const urlEncode = function urlEncode(params) {
  const str = [];
  Object.entries(params).forEach(([key, value]) => {
    str.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  });
  return str.join('&');
};
