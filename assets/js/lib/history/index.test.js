import { faker } from '@faker-js/faker';

import * as history from '.';

describe('historyLength', () => {
  it('should return the current history length with a mocked window implementation', () => {
    const length = faker.number.int();
    const mockWindow = { history: { length } };

    expect(history.length(mockWindow)).toBe(length);
  });

  it('should return the current history length using the native window as default', () => {
    expect(history.length()).toBe(1);
  });
});
