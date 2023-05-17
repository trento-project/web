// TODO remove dependency from the store when the fixme is fixed
import { updateLastExecution } from '@state/actions/lastExecutions';
import { joinChannel } from '@lib/network/socket';
import { setExecutionStarted } from '@state/lastExecutions';

const registerEvents = (store, socket, channelName, events) => {
  const channel = socket.channel(channelName, {});

  events.forEach((event) => {
    channel.on(event, (payload) =>
      store.dispatch({ type: event.toUpperCase(), payload })
    );
  });

  joinChannel(channel);
};

const processChannelEvents = (reduxStore, socket) => {
  registerEvents(reduxStore, socket, 'monitoring:hosts', [
    'host_registered',
    'host_details_updated',
    'heartbeat_succeded',
    'heartbeat_failed',
    'host_deregistered',
  ]);
  registerEvents(reduxStore, socket, 'monitoring:clusters', [
    'cluster_registered',
    'cluster_details_updated',
    'checks_execution_started',
    'checks_execution_completed',
    'checks_results_updated',
    'cluster_health_changed',
    'cluster_cib_last_written_updated',
  ]);
  registerEvents(reduxStore, socket, 'monitoring:sap_systems', [
    'sap_system_registered',
    'sap_system_health_changed',
    'application_instance_registered',
    'application_instance_health_changed',
  ]);
  registerEvents(reduxStore, socket, 'monitoring:databases', [
    'database_registered',
    'database_health_changed',
    'database_instance_registered',
    'database_instance_health_changed',
    'database_instance_system_replication_changed',
  ]);

  // FIXME: This is to overcome the fact that we are generating names with registerEvents
  // in the future we want to remove this and use the constants directly,
  // since events and actions may have different names and parameters.
  const channel = socket.channel('monitoring:executions', {});
  channel.on('execution_completed', ({ group_id: groupID }) => {
    reduxStore.dispatch(updateLastExecution(groupID));
  });
  channel.on('execution_started', ({ group_id: groupID, targets }) => {
    reduxStore.dispatch(setExecutionStarted({ groupID, targets }));
  });

  joinChannel(channel);
};

export default processChannelEvents;
