import { get } from '@lib/network';

export const getAboutPageData = () => get('/api/about');
