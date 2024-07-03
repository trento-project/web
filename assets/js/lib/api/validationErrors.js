import { flow, first } from 'lodash';
import { get, filter, map } from 'lodash/fp';

const selectField = (keyword) => (error) => {
  const pointer = get(['source', 'pointer'], error);

  return pointer === `/${keyword}`;
};

export const hasError = (keyword, errors) => errors.some(selectField(keyword));

export const getError = (keyword, errors) =>
  flow([filter(selectField(keyword)), first, get('detail')])(errors);

export const defaultGlobalError = {
  title: 'Unexpected error',
  detail: 'Something went wrong.',
};

export const getGlobalError = (errors) =>
  flow([
    filter(
      (error) => !(typeof error === 'object' && error && 'source' in error)
    ),
    map((error) =>
      typeof error === 'object' && error && 'detail' in error
        ? error
        : defaultGlobalError
    ),
    first,
    get('detail'),
  ])(errors);
