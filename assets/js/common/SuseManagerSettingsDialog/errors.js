import { get } from 'lodash';

export const hasError = (keyword, errors) =>
  errors.some((error) => {
    const pointer = get(error, ['source', 'pointer']);

    if (!pointer) {
      return false;
    }

    return pointer === `/${keyword}`;
  });
