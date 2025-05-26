import { map, get, find } from 'lodash';

export const OPTION_ALL = 'all';

export const normalizeOptions = (options) =>
  map(options, (option) => {
    const optionValue = get(option, 'value', option);
    return {
      value: optionValue,
      disabled: get(option, 'disabled', false),
      key: get(option, 'key', optionValue),
    };
  });

const findOptionByKey = (options, key) => find(options, { key });

export const createSelectedOptionFetcher =
  (selectedOptionFetcher) => (options, selection) =>
    selection === OPTION_ALL
      ? findOptionByKey(options, OPTION_ALL)
      : selectedOptionFetcher(options, selection);

export const defaultFetchSelectedOption = createSelectedOptionFetcher(
  (options, selectedValue) => findOptionByKey(options, selectedValue)
);

export const createOptionRenderer = (optionAllLabel, renderer) => (option) =>
  option.key === OPTION_ALL
    ? optionAllLabel
    : renderer(option.value, option.disabled);

export const defaultRenderOption = createOptionRenderer(
  OPTION_ALL,
  (item) => item
);
