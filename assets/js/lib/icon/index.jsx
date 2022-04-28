import classNames from 'classnames';

export const computedIconCssClass = (fillColor, centered) => {
  return classNames(fillColor, { 'mx-auto': centered });
};
