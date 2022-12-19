import { urlEncode } from '.';

describe('Serialization', () => {
  it('should encode the given params as url', async () => {
    const url = urlEncode({ a: 'b', c: 'd', e: 'f' });
    const expected = 'a=b&c=d&e=f';

    expect(url).toEqual(expected);
  });
});
