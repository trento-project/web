import { get } from '@lib/network';

export const fetchHostFilesystemData = (hostId) =>
  get(`charts/hosts/${hostId}/filesystem`);

export const fetchHostTimeSeriesData = (hostId, chartId, start, end) =>
  get(`charts/hosts/${hostId}/${chartId}?from=${start}&to=${end}`);
