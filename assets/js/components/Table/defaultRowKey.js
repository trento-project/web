import { get } from 'lodash';

export const defaultRowKey = (item, index) => get(item, 'key', index);
