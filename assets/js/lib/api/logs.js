import axios from 'axios';

export const lokiClient = axios.create({
  baseURL: 'http://localhost:3123/api/',
});

export const getLabelValues = async (label) => {
  try {
    const {
      data: { data: filenames },
    } = await lokiClient.get(`label/${label}/values`);

    return filenames;
  } catch (error) {
    return error;
  }
};

export const queryOne = async (query) => {
  try {
    const params = new URLSearchParams();
    params.append('query', query);
    const {
      data: {
        data: { result },
      },
    } = await lokiClient.post('/query_range', params);
    if (result.length > 0) {
      const { values } = result[0];
      return values.map(([time, value]) => ({ time, value }));
    }

    return [];
  } catch (error) {
    return error;
  }
};
