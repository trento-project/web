export const LOGIN_ATTEMPT = 'login_attempt';
export const RESOURCE_TAGGING = 'resource_tagging';
export const RESOURCE_UNTAGGING = 'resource_untagging';
export const API_KEY_GENERATION = 'api_key_generation';
export const SAVING_SUMA_SETTINGS = 'saving_suma_settings';
export const CHANGING_SUMA_SETTINGS = 'changing_suma_settings';
export const CLEARING_SUMA_SETTINGS = 'clearing_suma_settings';
export const USER_CREATION = 'user_creation';
export const USER_MODIFICATION = 'user_modification';
export const USER_DELETION = 'user_deletion';
export const PROFILE_UPDATE = 'profile_update';
export const CLUSTER_CHECKS_EXECUTION_REQUEST =
  'cluster_checks_execution_request';
export const ACTIVITY_LOG_SETTINGS_UPDATE = 'activity_log_settings_update';

// Host events
export const HEARTBEAT_FAILED = 'heartbeat_failed';
export const HEARTBEAT_SUCCEEDED = 'heartbeat_succeeded';
export const HOST_CHECKS_HEALTH_CHANGED = 'host_checks_health_changed';
export const HOST_CHECKS_SELECTED = 'host_checks_selected';
export const HOST_DEREGISTERED = 'host_deregistered';
export const HOST_DEREGISTRATION_REQUESTED = 'host_deregistration_requested';
export const HOST_DETAILS_UPDATED = 'host_details_updated';
export const HOST_HEALTH_CHANGED = 'host_health_changed';
export const HOST_REGISTERED = 'host_registered';
export const HOST_RESTORED = 'host_restored';
export const HOST_ROLLED_UP = 'host_rolled_up';
export const HOST_ROLL_UP_REQUESTED = 'host_roll_up_requested';
export const HOST_SAPTUNE_HEALTH_CHANGED = 'host_saptune_health_changed';
export const HOST_TOMBSTONED = 'host_tombstoned';
export const PROVIDER_UPDATED = 'provider_updated';
export const SAPTUNE_STATUS_UPDATED = 'saptune_status_updated';
export const SLES_SUBSCRIPTIONS_UPDATED = 'sles_subscriptions_updated';
export const SOFTWARE_UPDATES_DISCOVERY_CLEARED =
  'software_updates_discovery_cleared';
export const SOFTWARE_UPDATES_DISCOVERY_REQUESTED =
  'software_updates_discovery_requested';
export const SOFTWARE_UPDATES_HEALTH_CHANGED =
  'software_updates_health_changed';

// Cluster events
export const CHECKS_SELECTED = 'checks_selected';
export const CLUSTER_CHECKS_HEALTH_CHANGED = 'cluster_checks_health_changed';
export const CLUSTER_DEREGISTERED = 'cluster_deregistered';
export const CLUSTER_DETAILS_UPDATED = 'cluster_details_updated';
export const CLUSTER_DISCOVERED_HEALTH_CHANGED =
  'cluster_discovered_health_changed';
export const CLUSTER_HEALTH_CHANGED = 'cluster_health_changed';
export const CLUSTER_REGISTERED = 'cluster_registered';
export const CLUSTER_RESTORED = 'cluster_restored';
export const CLUSTER_ROLLED_UP = 'cluster_rolled_up';
export const CLUSTER_ROLL_UP_REQUESTED = 'cluster_roll_up_requested';
export const CLUSTER_TOMBSTONED = 'cluster_tombstoned';
export const HOST_ADDED_TO_CLUSTER = 'host_added_to_cluster';
export const HOST_REMOVED_FROM_CLUSTER = 'host_removed_from_cluster';

// SAP System events

export const APPLICATION_INSTANCE_DEREGISTERED =
  'application_instance_deregistered';
export const APPLICATION_INSTANCE_HEALTH_CHANGED =
  'application_instance_health_changed';
export const APPLICATION_INSTANCE_MARKED_ABSENT =
  'application_instance_marked_absent';
export const APPLICATION_INSTANCE_MARKED_PRESENT =
  'application_instance_marked_present';
export const APPLICATION_INSTANCE_MOVED = 'application_instance_moved';
export const APPLICATION_INSTANCE_REGISTERED =
  'application_instance_registered';
export const SAP_SYSTEM_DATABASE_HEALTH_CHANGED =
  'sap_system_database_health_changed';
export const SAP_SYSTEM_DEREGISTERED = 'sap_system_deregistered';
export const SAP_SYSTEM_HEALTH_CHANGED = 'sap_system_health_changed';
export const SAP_SYSTEM_REGISTERED = 'sap_system_registered';
export const SAP_SYSTEM_RESTORED = 'sap_system_restored';
export const SAP_SYSTEM_ROLLED_UP = 'sap_system_rolled_up';
export const SAP_SYSTEM_ROLL_UP_REQUESTED = 'sap_system_roll_up_requested';
export const SAP_SYSTEM_TOMBSTONED = 'sap_system_tombstoned';
export const SAP_SYSTEM_UPDATED = 'sap_system_updated';

// Database events
export const DATABASE_DEREGISTERED = 'database_deregistered';
export const DATABASE_HEALTH_CHANGED = 'database_health_changed';
export const DATABASE_INSTANCE_DEREGISTERED = 'database_instance_deregistered';
export const DATABASE_INSTANCE_HEALTH_CHANGED =
  'database_instance_health_changed';
export const DATABASE_INSTANCE_MARKED_ABSENT =
  'database_instance_marked_absent';
export const DATABASE_INSTANCE_MARKED_PRESENT =
  'database_instance_marked_present';
export const DATABASE_INSTANCE_REGISTERED = 'database_instance_registered';
export const DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED =
  'database_instance_system_replication_changed';
export const DATABASE_REGISTERED = 'database_registered';
export const DATABASE_RESTORED = 'database_restored';
export const DATABASE_ROLLED_UP = 'database_rolled_up';
export const DATABASE_ROLL_UP_REQUESTED = 'database_roll_up_requested';
export const DATABASE_TENANTS_UPDATED = 'database_tenants_updated';
export const DATABASE_TOMBSTONED = 'database_tombstoned';

export const ACTIVITY_TYPES = [
  LOGIN_ATTEMPT,
  RESOURCE_TAGGING,
  RESOURCE_UNTAGGING,
  API_KEY_GENERATION,
  SAVING_SUMA_SETTINGS,
  CHANGING_SUMA_SETTINGS,
  CLEARING_SUMA_SETTINGS,
  USER_CREATION,
  USER_MODIFICATION,
  USER_DELETION,
  PROFILE_UPDATE,
  CLUSTER_CHECKS_EXECUTION_REQUEST,
  ACTIVITY_LOG_SETTINGS_UPDATE,
  // Host events
  HEARTBEAT_FAILED,
  HEARTBEAT_SUCCEEDED,
  HOST_CHECKS_HEALTH_CHANGED,
  HOST_CHECKS_SELECTED,
  HOST_DEREGISTERED,
  HOST_DEREGISTRATION_REQUESTED,
  HOST_DETAILS_UPDATED,
  HOST_HEALTH_CHANGED,
  HOST_REGISTERED,
  HOST_RESTORED,
  HOST_ROLLED_UP,
  HOST_ROLL_UP_REQUESTED,
  HOST_SAPTUNE_HEALTH_CHANGED,
  HOST_TOMBSTONED,
  PROVIDER_UPDATED,
  SAPTUNE_STATUS_UPDATED,
  SLES_SUBSCRIPTIONS_UPDATED,
  SOFTWARE_UPDATES_DISCOVERY_CLEARED,
  SOFTWARE_UPDATES_DISCOVERY_REQUESTED,
  SOFTWARE_UPDATES_HEALTH_CHANGED,
  // Cluster events
  CHECKS_SELECTED,
  CLUSTER_CHECKS_HEALTH_CHANGED,
  CLUSTER_DEREGISTERED,
  CLUSTER_DETAILS_UPDATED,
  CLUSTER_DISCOVERED_HEALTH_CHANGED,
  CLUSTER_HEALTH_CHANGED,
  CLUSTER_REGISTERED,
  CLUSTER_RESTORED,
  CLUSTER_ROLLED_UP,
  CLUSTER_ROLL_UP_REQUESTED,
  CLUSTER_TOMBSTONED,
  HOST_ADDED_TO_CLUSTER,
  HOST_REMOVED_FROM_CLUSTER,
  // SAP System events
  APPLICATION_INSTANCE_DEREGISTERED,
  APPLICATION_INSTANCE_HEALTH_CHANGED,
  APPLICATION_INSTANCE_MARKED_ABSENT,
  APPLICATION_INSTANCE_MARKED_PRESENT,
  APPLICATION_INSTANCE_MOVED,
  APPLICATION_INSTANCE_REGISTERED,
  SAP_SYSTEM_DATABASE_HEALTH_CHANGED,
  SAP_SYSTEM_DEREGISTERED,
  SAP_SYSTEM_HEALTH_CHANGED,
  SAP_SYSTEM_REGISTERED,
  SAP_SYSTEM_RESTORED,
  SAP_SYSTEM_ROLLED_UP,
  SAP_SYSTEM_ROLL_UP_REQUESTED,
  SAP_SYSTEM_TOMBSTONED,
  SAP_SYSTEM_UPDATED,
  // Database events
  DATABASE_DEREGISTERED,
  DATABASE_HEALTH_CHANGED,
  DATABASE_INSTANCE_DEREGISTERED,
  DATABASE_INSTANCE_HEALTH_CHANGED,
  DATABASE_INSTANCE_MARKED_ABSENT,
  DATABASE_INSTANCE_MARKED_PRESENT,
  DATABASE_INSTANCE_REGISTERED,
  DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED,
  DATABASE_REGISTERED,
  DATABASE_RESTORED,
  DATABASE_ROLLED_UP,
  DATABASE_ROLL_UP_REQUESTED,
  DATABASE_TENANTS_UPDATED,
  DATABASE_TOMBSTONED,
];

const sumaSettingsResourceType = (_entry) => 'SUMA Settings';
const userResourceType = (_entry) => 'User';
const clusterResourceType = (_entry) => 'Cluster';
const hostResourceType = (_entry) => 'Host';
const sapSystemResourceType = (_entry) => 'SAP System';
const databaseResourceType = (_entry) => 'Database';

const taggingResourceType = (entry) =>
  ({
    host: hostResourceType(entry),
    cluster: clusterResourceType(entry),
    database: databaseResourceType(entry),
    sap_system: sapSystemResourceType(entry),
  })[entry.metadata?.resource_type] ?? 'Unable to determine resource type';

export const ACTIVITY_TYPES_CONFIG = {
  [LOGIN_ATTEMPT]: {
    label: 'Login Attempt',
    message: ({ metadata }) =>
      metadata?.reason ? 'Login failed' : 'User logged in',
    resource: (_entry) => 'Application',
  },
  [RESOURCE_TAGGING]: {
    label: 'Tag Added',
    message: ({ metadata }) =>
      `Tag "${metadata.added_tag}" added to "${metadata.resource_id}"`,
    resource: taggingResourceType,
  },
  [RESOURCE_UNTAGGING]: {
    label: 'Tag Removed',
    message: ({ metadata }) =>
      `Tag "${metadata.removed_tag}" removed from "${metadata.resource_id}"`,
    resource: taggingResourceType,
  },
  [API_KEY_GENERATION]: {
    label: 'API Key Generated',
    message: (_entry) => 'API Key was generated',
    resource: (_entry) => 'API Key',
  },
  [SAVING_SUMA_SETTINGS]: {
    label: 'SUMA Settings Saved',
    message: (_entry) => 'SUMA Settings was saved',
    resource: sumaSettingsResourceType,
  },
  [CHANGING_SUMA_SETTINGS]: {
    label: 'SUMA Settings Changed',
    message: (_entry) => 'SUMA Settings was changed',
    resource: sumaSettingsResourceType,
  },
  [CLEARING_SUMA_SETTINGS]: {
    label: 'SUMA Settings Cleared',
    message: (_entry) => 'SUMA Settings was cleared',
    resource: sumaSettingsResourceType,
  },
  [USER_CREATION]: {
    label: 'User Created',
    message: (_entry) => `User was created`,
    resource: userResourceType,
  },
  [USER_MODIFICATION]: {
    label: 'User Modified',
    message: (_entry) => `User was modified`,
    resource: userResourceType,
  },
  [USER_DELETION]: {
    label: 'User Deleted',
    message: (_entry) => `User was deleted`,
    resource: userResourceType,
  },
  [PROFILE_UPDATE]: {
    label: 'Profile Updated',
    message: (_entry) => `User modified profile`,
    resource: (_entry) => 'Profile',
  },
  [CLUSTER_CHECKS_EXECUTION_REQUEST]: {
    label: 'Checks Execution Requested',
    message: (_entry) => `Checks execution requested for cluster`,
    resource: clusterResourceType,
  },
  [ACTIVITY_LOG_SETTINGS_UPDATE]: {
    label: 'Activity Log Settings Updated',
    message: (_entry) => `Activity log settings were updated`,
    resource: (_entry) => 'Activity Log Settings',
  },
  // Host events
  [HEARTBEAT_FAILED]: {
    label: 'Heartbeat Failed',
    message: (_entry) => `Host heartbeat failed`,
    resource: hostResourceType,
  },
  [HEARTBEAT_SUCCEEDED]: {
    label: 'Heartbeat Succeeded',
    message: (_entry) => `Host heartbeat succeeded`,
    resource: hostResourceType,
  },
  [HOST_CHECKS_HEALTH_CHANGED]: {
    label: 'Checks Health Changed',
    message: (_entry) => `Checks health for host changed`,
    resource: hostResourceType,
  },
  [HOST_CHECKS_SELECTED]: {
    label: 'Host Checks Selected',
    message: (_entry) => `Checks were selected for host`,
    resource: hostResourceType,
  },
  [HOST_DEREGISTERED]: {
    label: 'Host Deregistered',
    message: (_entry) => `Host was deregistered`,
    resource: hostResourceType,
  },
  [HOST_DEREGISTRATION_REQUESTED]: {
    label: 'Host Deregistration Requested',
    message: (_entry) => `Deregistration for host was requested`,
    resource: hostResourceType,
  },
  [HOST_DETAILS_UPDATED]: {
    label: 'Host Details Updated',
    message: (_entry) => `Host details were updated`,
    resource: hostResourceType,
  },
  [HOST_HEALTH_CHANGED]: {
    label: 'Host Health Changed',
    message: (_entry) => `Host health changed`,
    resource: hostResourceType,
  },
  [HOST_REGISTERED]: {
    label: 'Host Registered',
    message: (_entry) => `A new host was registered`,
    resource: hostResourceType,
  },
  [HOST_RESTORED]: {
    label: 'Host Restored',
    message: (_entry) => `Host was restored`,
    resource: hostResourceType,
  },
  [HOST_ROLLED_UP]: {
    label: 'Host Rolled Up',
    message: (_entry) => `Host was rolled up`,
    resource: hostResourceType,
  },
  [HOST_ROLL_UP_REQUESTED]: {
    label: 'Host Roll Up Requested',
    message: (_entry) => `Roll up for host was requested`,
    resource: hostResourceType,
  },
  [HOST_SAPTUNE_HEALTH_CHANGED]: {
    label: 'Host Saptune Health Changed',
    message: (_entry) => `Host saptune health changed`,
    resource: hostResourceType,
  },
  [HOST_TOMBSTONED]: {
    label: 'Host Tombstoned',
    message: (_entry) => `Host was tombstoned`,
    resource: hostResourceType,
  },
  [PROVIDER_UPDATED]: {
    label: 'Provider Updated',
    message: (_entry) => `Host Provider was updated`,
    resource: hostResourceType,
  },
  [SAPTUNE_STATUS_UPDATED]: {
    label: 'Saptune Status Updated',
    message: (_entry) => `Host Saptune status was updated`,
    resource: hostResourceType,
  },
  [SLES_SUBSCRIPTIONS_UPDATED]: {
    label: 'SLES Subscriptions Updated',
    message: (_entry) => `SLES subscriptions were updated`,
    resource: hostResourceType,
  },
  [SOFTWARE_UPDATES_DISCOVERY_CLEARED]: {
    label: 'Software Updates Discovery Cleared',
    message: (_entry) => `Software updates discovery was cleared`,
    resource: hostResourceType,
  },
  [SOFTWARE_UPDATES_DISCOVERY_REQUESTED]: {
    label: 'Software Updates Discovery Requested',
    message: (_entry) => `Software updates discovery was requested`,
    resource: hostResourceType,
  },
  [SOFTWARE_UPDATES_HEALTH_CHANGED]: {
    label: 'Software Updates Health Changed',
    message: (_entry) => `Software updates health changed`,
    resource: hostResourceType,
  },
  // Cluster events
  [CHECKS_SELECTED]: {
    label: 'Cluster Checks Selected',
    message: (_entry) => `Checks were selected for cluster`,
    resource: clusterResourceType,
  },
  [CLUSTER_CHECKS_HEALTH_CHANGED]: {
    label: 'Cluster Checks Health Changed',
    message: (_entry) => `Checks health for cluster changed`,
    resource: clusterResourceType,
  },
  [CLUSTER_DEREGISTERED]: {
    label: 'Cluster Deregistered',
    message: (_entry) => `Cluster was deregistered`,
    resource: clusterResourceType,
  },
  [CLUSTER_DETAILS_UPDATED]: {
    label: 'Cluster Details Updated',
    message: (_entry) => `Cluster details were updated`,
    resource: clusterResourceType,
  },
  [CLUSTER_DISCOVERED_HEALTH_CHANGED]: {
    label: 'Cluster Discovered Health Changed',
    message: (_entry) => `Cluster's discovered health changed`,
    resource: clusterResourceType,
  },
  [CLUSTER_HEALTH_CHANGED]: {
    label: 'Cluster Health Changed',
    message: (_entry) => `Cluster health changed`,
    resource: clusterResourceType,
  },
  [CLUSTER_REGISTERED]: {
    label: 'Cluster Registered',
    message: (_entry) => `A new cluster was registered`,
    resource: clusterResourceType,
  },
  [CLUSTER_RESTORED]: {
    label: 'Cluster Restored',
    message: (_entry) => `Cluster was restored`,
    resource: clusterResourceType,
  },
  [CLUSTER_ROLLED_UP]: {
    label: 'Cluster Rolled Up',
    message: (_entry) => `Cluster was rolled up`,
    resource: clusterResourceType,
  },
  [CLUSTER_ROLL_UP_REQUESTED]: {
    label: 'Cluster Roll Up Requested',
    message: (_entry) => `Roll up for cluster was requested`,
    resource: clusterResourceType,
  },
  [CLUSTER_TOMBSTONED]: {
    label: 'Cluster Tombstoned',
    message: (_entry) => `Cluster was tombstoned`,
    resource: clusterResourceType,
  },
  [HOST_ADDED_TO_CLUSTER]: {
    label: 'Host Added to Cluster',
    message: (_entry) => `Host was added to cluster`,
    resource: clusterResourceType,
  },
  [HOST_REMOVED_FROM_CLUSTER]: {
    label: 'Host Removed from Cluster',
    message: (_entry) => `Host was removed from cluster`,
    resource: clusterResourceType,
  },
  // SAP System events
  [APPLICATION_INSTANCE_DEREGISTERED]: {
    label: 'Application Instance Deregistered',
    message: (_entry) => `Application instance was deregistered`,
    resource: sapSystemResourceType,
  },
  [APPLICATION_INSTANCE_HEALTH_CHANGED]: {
    label: 'Application Instance Health Changed',
    message: (_entry) => `Application instance health changed`,
    resource: sapSystemResourceType,
  },
  [APPLICATION_INSTANCE_MARKED_ABSENT]: {
    label: 'Application Instance Marked Absent',
    message: (_entry) => `Application instance was marked absent`,
    resource: sapSystemResourceType,
  },
  [APPLICATION_INSTANCE_MARKED_PRESENT]: {
    label: 'Application Instance Marked Present',
    message: (_entry) => `Application instance was marked present`,
    resource: sapSystemResourceType,
  },
  [APPLICATION_INSTANCE_MOVED]: {
    label: 'Application Instance Moved',
    message: (_entry) => `Application instance was moved`,
    resource: sapSystemResourceType,
  },
  [APPLICATION_INSTANCE_REGISTERED]: {
    label: 'Application Instance Registered',
    message: (_entry) => `Application instance was registered`,
    resource: sapSystemResourceType,
  },
  [SAP_SYSTEM_DATABASE_HEALTH_CHANGED]: {
    label: 'SAP System Database Health Changed',
    message: (_entry) => `SAP system database health changed`,
    resource: sapSystemResourceType,
  },
  [SAP_SYSTEM_DEREGISTERED]: {
    label: 'SAP System Deregistered',
    message: (_entry) => `SAP system was deregistered`,
    resource: sapSystemResourceType,
  },
  [SAP_SYSTEM_HEALTH_CHANGED]: {
    label: 'SAP System Health Changed',
    message: (_entry) => `SAP system health changed`,
    resource: sapSystemResourceType,
  },
  [SAP_SYSTEM_REGISTERED]: {
    label: 'SAP System Registered',
    message: (_entry) => `A new SAP system was registered`,
    resource: sapSystemResourceType,
  },
  [SAP_SYSTEM_RESTORED]: {
    label: 'SAP System Restored',
    message: (_entry) => `SAP system was restored`,
    resource: sapSystemResourceType,
  },
  [SAP_SYSTEM_ROLLED_UP]: {
    label: 'SAP System Rolled Up',
    message: (_entry) => `SAP system was rolled up`,
    resource: sapSystemResourceType,
  },
  [SAP_SYSTEM_ROLL_UP_REQUESTED]: {
    label: 'SAP System Roll Up Requested',
    message: (_entry) => `Roll up for SAP system was requested`,
    resource: sapSystemResourceType,
  },
  [SAP_SYSTEM_TOMBSTONED]: {
    label: 'SAP System Tombstoned',
    message: (_entry) => `SAP system was tombstoned`,
    resource: sapSystemResourceType,
  },
  [SAP_SYSTEM_UPDATED]: {
    label: 'SAP System Updated',
    message: (_entry) => `SAP system was updated`,
    resource: sapSystemResourceType,
  },
  // Database events
  [DATABASE_DEREGISTERED]: {
    label: 'Database Deregistered',
    message: (_entry) => `Database was deregistered`,
    resource: databaseResourceType,
  },
  [DATABASE_HEALTH_CHANGED]: {
    label: 'Database Health Changed',
    message: (_entry) => `Database health changed`,
    resource: databaseResourceType,
  },
  [DATABASE_INSTANCE_DEREGISTERED]: {
    label: 'Database Instance Deregistered',
    message: (_entry) => `Database instance was deregistered`,
    resource: databaseResourceType,
  },
  [DATABASE_INSTANCE_HEALTH_CHANGED]: {
    label: 'Database Instance Health Changed',
    message: (_entry) => `Database instance health changed`,
    resource: databaseResourceType,
  },
  [DATABASE_INSTANCE_MARKED_ABSENT]: {
    label: 'Database Instance Marked Absent',
    message: (_entry) => `Database instance was marked absent`,
    resource: databaseResourceType,
  },
  [DATABASE_INSTANCE_MARKED_PRESENT]: {
    label: 'Database Instance Marked Present',
    message: (_entry) => `Database instance was marked present`,
    resource: databaseResourceType,
  },
  [DATABASE_INSTANCE_REGISTERED]: {
    label: 'Database Instance Registered',
    message: (_entry) => `Database instance was registered`,
    resource: databaseResourceType,
  },
  [DATABASE_INSTANCE_SYSTEM_REPLICATION_CHANGED]: {
    label: 'Database Instance System Replication Changed',
    message: (_entry) => `Database instance system replication changed`,
    resource: databaseResourceType,
  },
  [DATABASE_REGISTERED]: {
    label: 'Database Registered',
    message: (_entry) => `A new database was registered`,
    resource: databaseResourceType,
  },
  [DATABASE_RESTORED]: {
    label: 'Database Restored',
    message: (_entry) => `Database was restored`,
    resource: databaseResourceType,
  },
  [DATABASE_ROLLED_UP]: {
    label: 'Database Rolled Up',
    message: (_entry) => `Database was rolled up`,
    resource: databaseResourceType,
  },
  [DATABASE_ROLL_UP_REQUESTED]: {
    label: 'Database Roll Up Requested',
    message: (_entry) => `Roll up for database was requested`,
    resource: databaseResourceType,
  },
  [DATABASE_TENANTS_UPDATED]: {
    label: 'Database Tenants Updated',
    message: (_entry) => `Database tenants were updated`,
    resource: databaseResourceType,
  },
  [DATABASE_TOMBSTONED]: {
    label: 'Database Tombstoned',
    message: (_entry) => `Database was tombstoned`,
    resource: databaseResourceType,
  },
};

const activityTypeConfig = ({ type }) => ACTIVITY_TYPES_CONFIG[type];

export const toLabel = (entry) =>
  activityTypeConfig(entry)?.label ?? entry.type;

export const toMessage = (entry) =>
  activityTypeConfig(entry)?.message(entry) ?? entry.type;

export const toResource = (entry) =>
  activityTypeConfig(entry)?.resource(entry) ?? 'Unrecognized resource';

export const LEVEL_DEBUG = 'debug';
export const LEVEL_INFO = 'info';
export const LEVEL_WARNING = 'warning';
export const LEVEL_ERROR = 'error';

export const ACTIVITY_LOG_LEVELS = [
  LEVEL_DEBUG,
  LEVEL_INFO,
  LEVEL_WARNING,
  LEVEL_ERROR,
];
