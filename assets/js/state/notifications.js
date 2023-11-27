export const NOTIFICATION = 'NOTIFICATION';

export const notify = ({ text, icon }) => ({
  type: NOTIFICATION,
  payload: { text, icon },
});
