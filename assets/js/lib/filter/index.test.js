import { faker } from '@faker-js/faker';

import { containsSubstring } from '.';

describe('search', () => {
  it('should always match with an empty search string', () => {
    expect(containsSubstring('', '')).toBe(true);
    expect(containsSubstring(faker.word.words(10), '')).toBe(true);
  });

  it('should match strings case in an insensitive fashion', () => {
    const original = faker.word.words(1);
    const upper = original.toUpperCase();
    const lower = original.toLowerCase();

    expect(containsSubstring(original, upper)).toBe(true);
    expect(containsSubstring(original, lower)).toBe(true);
  });

  it('should match substrings', () => {
    const original = faker.word.words(1);
    const sub = original.substring(original.length / 2);

    expect(containsSubstring(original, sub)).toBe(true);
  });

  it('should not match not included words', () => {
    const words = faker.word.words(2).split(' ');

    expect(containsSubstring(words[0], words[1])).toBe(false);
    expect(containsSubstring('', words[1])).toBe(false);
  });

  it('should match unicode in different forms', () => {
    const name1 = '\u0041\u006d\u00e9\u006c\u0069\u0065';
    const name2 = '\u0041\u006d\u0065\u0301\u006c\u0069\u0065';

    expect(containsSubstring(name1, name2)).toBe(true);
  });
});
