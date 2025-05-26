import '@testing-library/jest-dom';
import { find } from 'lodash';

import { normalizedOptionsFactory } from '@lib/test-utils/factories/select';

import {
  createSelectedOptionFetcher,
  createOptionRenderer,
  normalizeOptions,
  defaultFetchSelectedOption,
  defaultRenderOption,
} from './lib';

describe('Select Component library', () => {
  it('should normalize options', () => {
    const options = [
      'foo',
      { value: 'bar' },
      { value: 'baz', disabled: true },
      { value: 'qux', disabled: true, key: 'qux_key' },
      {
        value: { nested: 'propz', anotherNested: 'propz2' },
        key: 'complex_key',
      },
    ];

    const expected = [
      {
        value: 'foo',
        disabled: false,
        key: 'foo',
      },
      {
        value: 'bar',
        disabled: false,
        key: 'bar',
      },
      {
        value: 'baz',
        disabled: true,
        key: 'baz',
      },
      {
        value: 'qux',
        disabled: true,
        key: 'qux_key',
      },
      {
        value: { nested: 'propz', anotherNested: 'propz2' },
        disabled: false,
        key: 'complex_key',
      },
    ];

    expect(normalizeOptions(options)).toStrictEqual(expected);
  });

  describe('default selected option fetcher', () => {
    it('should return the All option', () => {
      const optionAll = normalizedOptionsFactory.build({ key: 'all' });

      const options = [optionAll, ...normalizedOptionsFactory.buildList(3)];

      expect(defaultFetchSelectedOption(options, 'all')).toEqual(optionAll);
    });

    it('should return the selected option by key', () => {
      const options = normalizedOptionsFactory.buildList(3);

      const [
        _notInterestingOption,
        interestingOption,
        _anotherNotInterestingOption,
      ] = options;

      expect(
        defaultFetchSelectedOption(options, interestingOption.key)
      ).toEqual(interestingOption);
    });

    it('should return undefined when the key was not found', () => {
      const options = normalizedOptionsFactory.buildList(2);

      expect(
        defaultFetchSelectedOption(options, 'non_existent_key')
      ).toBeUndefined();
    });
  });

  describe('custom selected option fetcher', () => {
    const customFetchSelectedOption = createSelectedOptionFetcher(
      (options, selectedValue) =>
        find(options, { value: { someProp: selectedValue } })
    );

    it('should return the All option', () => {
      const optionAll = normalizedOptionsFactory.build({ key: 'all' });

      const options = [optionAll, ...normalizedOptionsFactory.buildList(3)];

      expect(customFetchSelectedOption(options, 'all')).toEqual(optionAll);
    });

    it('should return the matching option', () => {
      const options = [
        normalizedOptionsFactory.build({ value: { someProp: 'test' } }),
        normalizedOptionsFactory.build({ value: { someProp: 'test2' } }),
        normalizedOptionsFactory.build({ value: { someProp: 'test3' } }),
      ];

      expect(customFetchSelectedOption(options, 'test2')).toEqual(options[1]);
    });

    it('should return undefined if no matching option is found', () => {
      const options = normalizedOptionsFactory.buildList(5);

      expect(customFetchSelectedOption(options, 'foo')).toBeUndefined();
    });
  });

  describe('default option renderer', () => {
    it('should render the All option', () => {
      const option = normalizedOptionsFactory.build({ key: 'all' });

      expect(defaultRenderOption(option)).toBe('all');
    });

    it('should render a regular option', () => {
      const option = normalizedOptionsFactory.build({
        key: 'foo',
        value: 'Fooz',
      });

      expect(defaultRenderOption(option)).toBe('Fooz');
    });
  });

  describe('custom option renderer', () => {
    const customRenderOption = createOptionRenderer(
      'All items',
      (value, disabled) => {
        if (disabled) {
          return `Disabled: ${value}`;
        }
        return `Custom: ${value}`;
      }
    );

    it('should render the All option', () => {
      const option = normalizedOptionsFactory.build({ key: 'all' });

      expect(customRenderOption(option)).toBe('All items');
    });

    it('should render a regular option', () => {
      const option = normalizedOptionsFactory.build({
        key: 'foo',
        value: 'Fooz',
        disabled: false,
      });

      expect(customRenderOption(option)).toBe('Custom: Fooz');
    });

    it('should render a regular disabled option', () => {
      const option = normalizedOptionsFactory.build({
        value: 'Fooz',
        disabled: true,
      });

      expect(customRenderOption(option)).toBe('Disabled: Fooz');
    });
  });
});
