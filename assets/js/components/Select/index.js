import Select, { OPTION_ALL } from './Select';

export const createOptionRenderer = (optionAllLabel, renderer) => (option) => {
  if (option.value === OPTION_ALL) {
    return optionAllLabel;
  }
  return renderer(option.value, option.disabled);
};

export { OPTION_ALL };

export default Select;
