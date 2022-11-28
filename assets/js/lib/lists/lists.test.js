import { page, pages } from '.';

const pagedList = [...Array(30).keys()];

describe('page', () => {
  it('should give a subslice of an array', () => {
    expect(page(1, pagedList)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(page(2, pagedList)).toEqual([
      10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    ]);

    expect(page(4, [...Array(32).keys()])).toEqual([30, 31]);
  });
});

describe('pages', () => {
  it('should return the number of pages that an array contains', () => {
    expect(pages(pagedList)).toBe(3);
  });
});
