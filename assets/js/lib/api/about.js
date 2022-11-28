import { get } from '@lib/network';

export const getAboutData = () => get('/api/about');
