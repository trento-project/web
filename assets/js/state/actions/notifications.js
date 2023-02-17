export const NOTIFICATION = 'NOTIFICATION';

export const notify = ({ text, icon }) => ({
  type: NOTIFICATION,
  payload: { text, icon },
});

export const notifyChecksExecutionRequested = (clusterName) =>
  notify({
    text: `Checks execution requested, cluster: ${clusterName}`,
    icon: '🐰',
  });

export const notifyChecksExecutionRequestFailed = (clusterName) =>
  notify({
    text: `Unable to start execution for cluster: ${clusterName}`,
    icon: '❌',
  });
