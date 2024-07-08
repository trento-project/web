import { flow, first } from 'lodash';
import { get, filter } from 'lodash/fp';

export const hasError = (keyword, errors) =>
  errors.some((error) => {
    const pointer = get(['source', 'pointer'], error);

    return pointer === `/${keyword}`;
  });

export const getError = (keyword, errors) =>
  flow([
    filter((error) => {
      const pointer = get(['source', 'pointer'], error);

      return pointer === `/${keyword}`;
    }),
    first,
    get('detail'),
  ])(errors);
