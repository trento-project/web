import { faker } from '@faker-js/faker';

import { foundStringNaive } from '.';

describe('search', () => {
  it('should always match with an empty search string', () => {
    expect(foundStringNaive('', '')).toBe(true);
    expect(foundStringNaive(faker.word.words(10), '')).toBe(true);
  });

  it('should match strings case in an insensitive fashion', () => {
    const original = faker.word.words(1);
    const upper = original.toUpperCase();
    const lower = original.toLowerCase();

    expect(foundStringNaive(original, upper)).toBe(true);
    expect(foundStringNaive(original, lower)).toBe(true);
  });

  it('should match substrings', () => {
    const original = faker.word.words(1);
    const sub = original.substring(original.length / 2);

    expect(foundStringNaive(original, sub)).toBe(true);
  });

  it('should not match not included words', () => {
    const words = faker.word.words(2).split(' ');

    expect(foundStringNaive(words[0], words[1])).toBe(false);
    expect(foundStringNaive('', words[1])).toBe(false);
  });

  it('should match unicode in different forms', () => {
    const name1 = '\u0041\u006d\u00e9\u006c\u0069\u0065';
    const name2 = '\u0041\u006d\u0065\u0301\u006c\u0069\u0065';

    expect(foundStringNaive(name1, name2)).toBe(true);
  });
});
