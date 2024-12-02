import { noop } from 'lodash';
import {
  addRefreshRateToSearchParams,
  detectRefreshRate,
  removeRefreshRateFromSearchParams,
  resetAutorefresh,
} from './autorefresh';

jest.useFakeTimers();

describe('Autorefresh', () => {
  it.each`
    input        | expectedDetection
    ${1}         | ${'off'}
    ${null}      | ${'off'}
    ${undefined} | ${'off'}
    ${'off'}     | ${'off'}
    ${5000}      | ${5000}
    ${10000}     | ${10000}
    ${30000}     | ${30000}
    ${60000}     | ${60000}
    ${300000}    | ${300000}
    ${1800000}   | ${1800000}
    ${'5000'}    | ${5000}
    ${'10000'}   | ${10000}
    ${'30000'}   | ${30000}
    ${'60000'}   | ${60000}
    ${'300000'}  | ${300000}
    ${'1800000'} | ${1800000}
  `('should detect refresh rate', ({ input, expectedDetection }) => {
    const detectedRefreshRate = detectRefreshRate(input);
    expect(detectedRefreshRate).toEqual(expectedDetection);
  });

  it.each`
    initialParams                 | expectation
    ${{ foo: 'bar', baz: 'qux' }} | ${[['foo', 'bar'], ['baz', 'qux'], ['refreshRate', '10']]}
    ${{}}                         | ${[['refreshRate', '10']]}
  `(
    'should add the autorefresh rate to the search params',
    ({ initialParams, expectation }) => {
      const sp = new URLSearchParams(initialParams);

      const result = addRefreshRateToSearchParams(sp, '10');

      expect(Array.from(result)).toEqual(expectation);
    }
  );

  it.each`
    initialParams                                    | expectation
    ${{ foo: 'bar', baz: 'qux' }}                    | ${[['foo', 'bar'], ['baz', 'qux']]}
    ${{ foo: 'bar', baz: 'qux', refreshRate: '10' }} | ${[['foo', 'bar'], ['baz', 'qux']]}
    ${{}}                                            | ${[]}
  `(
    'should remove the autorefresh rate to the search params',
    ({ initialParams, expectation }) => {
      const sp = new URLSearchParams(initialParams);

      const result = removeRefreshRateFromSearchParams(sp);

      expect(Array.from(result)).toEqual(expectation);
    }
  );

  describe('resetting autorefresh interval', () => {
    it('should return null when refresh rate is unsupported', () => {
      const operation = jest.fn();

      const { interval } = resetAutorefresh(null, operation, '50');

      expect(interval).toBeNull();

      jest.advanceTimersByTime(5000 * 6);
      expect(operation).not.toHaveBeenCalled();
    });

    it('should clear a previously set inteval', () => {
      const operation = jest.fn();

      const previousInterval = setInterval(operation, 5000);
      expect(previousInterval).not.toBeNull();

      jest.advanceTimersByTime(5000 * 4);
      expect(operation).toHaveBeenCalledTimes(4);

      resetAutorefresh(previousInterval, noop, '5000');

      // with time passing by the operation should not be called, except for the initial 4 times
      jest.advanceTimersByTime(5000 * 6);
      expect(operation).toHaveBeenCalledTimes(4);
    });

    it('should reset autorefresh interval', () => {
      const operation = jest.fn();

      resetAutorefresh(null, operation, '5000');

      expect(operation).not.toHaveBeenCalled();

      jest.advanceTimersByTime(5000 * 6);
      expect(operation).toHaveBeenCalledTimes(6);
    });

    it('should return a cleanup function for the autorefresh interval', () => {
      const operation = jest.fn();

      const { cleanup } = resetAutorefresh(null, operation, '5000');

      jest.advanceTimersByTime(5000 * 6);
      expect(operation).toHaveBeenCalledTimes(6);

      cleanup();

      jest.advanceTimersByTime(5000 * 10);
      // operation should not be called after cleanup
      expect(operation).toHaveBeenCalledTimes(6);
    });
  });
});
