import { get } from '@lib/network';

export const fetchHostFilesystemData = (hostId) =>
  get(`charts/hosts/${hostId}/filesystem`);
