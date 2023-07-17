import { TARGET_HOST } from '@lib/model';

export const getHostCheckSelection =
  (hostID) =>
  ({ checksSelection }) =>
    checksSelection?.[TARGET_HOST][hostID] || {};
