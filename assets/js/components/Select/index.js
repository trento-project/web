import Select, { OPTION_ALL } from './Select';

export const createOptionRenderer = (label, renderer) => (option) => {
  if (option === OPTION_ALL) {
    return label;
  }
  return renderer(option);
};

export { OPTION_ALL };

export default Select;
