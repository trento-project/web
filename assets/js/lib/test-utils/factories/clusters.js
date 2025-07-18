import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { format } from 'date-fns';
import { flatMap } from 'lodash';

import {
  healthEnum,
  cloudProviderEnum,
  hostFactory,
  sapSystemFactory,
  generateSid,
} from '.';

const clusterTypeEnum = () =>
  faker.helpers.arrayElement(['unknown', 'hana_scale_up']);

const hanaStatus = () => faker.helpers.arrayElement(['Primary', 'Failed']);

const ascsErsRole = () => faker.helpers.arrayElement(['ascs', 'ers']);

const hanaArchitectureTypeEnum = () =>
  faker.helpers.arrayElement(['classic', 'angi']);

const hanaScenarioTypeEnum = () =>
  faker.helpers.arrayElement([
    'performance_optimized',
    'cost_optimized',
    'unknown',
  ]);

export const sbdDevicesFactory = Factory.define(() => ({
  device: faker.system.filePath(),
  status: faker.helpers.arrayElement(['healthy', 'unhealthy']),
}));

export const clusterResourceParentFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  managed: faker.datatype.boolean(),
  multi_state: faker.datatype.boolean(),
}));

export const clusterResourceFactory = Factory.define(() => ({
  id: faker.string.uuid(),
  role: 'Started',
  status: 'Active',
  type: faker.color.human(),
  managed: faker.datatype.boolean(),
  fail_count: faker.number.int({ min: 10, max: 99 }),
  node: faker.animal.dog(),
  sid: generateSid(),
  parent: clusterResourceParentFactory.build(),
}));

export const hanaClusterSiteFactory = Factory.define(({ sequence }) => ({
  name: `site_${sequence}`,
  state: hanaStatus(),
  sr_health_state: '4',
}));

export const hanaClusterDetailsNodesFactory = Factory.define(() => ({
  name: faker.animal.dog(),
  site: faker.location.city(),
  virtual_ip: faker.internet.ip(),
  indexserver_actual_role: 'master',
  nameserver_actual_role: 'slave',
  hana_status: hanaStatus(),
  status: 'Online',
  attributes: Array.from({ length: 5 }).reduce(
    (acc, _) => ({
      ...acc,
      ...{ [faker.animal.cat()]: faker.animal.dog() },
    }),
    {}
  ),
}));

export const hanaClusterDetailsFactory = Factory.define(() => {
  const sites = hanaClusterSiteFactory.buildList(2);
  const nodes = sites.map(({ name: siteName }) =>
    hanaClusterDetailsNodesFactory.build({ site: siteName })
  );

  return {
    fencing_type: 'external/sbd',
    nodes,
    sites,
    sbd_devices: sbdDevicesFactory.buildList(3),
    secondary_sync_state: 'SOK',
    sr_health_state: '4',
    resources: clusterResourceFactory.buildList(2, {
      node: faker.helpers.arrayElement(nodes.map(({ name }) => name)),
    }),
    system_replication_mode: 'sync',
    system_replication_operation_mode: 'logreplay',
    maintenance_mode: false,
    architecture_type: hanaArchitectureTypeEnum(),
    hana_scenario: hanaScenarioTypeEnum(),
  };
});

export const ascsErsClusterNodeFactory = Factory.define(({ sequence }) => ({
  name: `${faker.person.firstName()}_${sequence}`,
  status: 'Online',
  roles: [ascsErsRole()],
  virtual_ips: [faker.internet.ip()],
  filesystems: [faker.system.filePath()],
  attributes: Array.from({ length: 5 }).reduce(
    (acc, _) => ({
      ...acc,
      ...{ [faker.animal.cat()]: faker.animal.dog() },
    }),
    {}
  ),
}));

export const ascsErsSapSystemFactory = Factory.define(() => ({
  sid: generateSid(),
  filesystem_resource_based: faker.datatype.boolean(),
  distributed: faker.datatype.boolean(),
  nodes: ascsErsClusterNodeFactory.buildList(2),
}));

export const ascsErsClusterDetailsFactory = Factory.define(({ params }) => {
  const { sap_systems_count = 1 } = params;
  const sapSystems = ascsErsSapSystemFactory.buildList(sap_systems_count);
  const nodeNames = flatMap(sapSystems, ({ nodes }) =>
    nodes.map(({ name }) => name)
  );

  return {
    fencing_type: 'external/sbd',
    sap_systems: sapSystems,
    sbd_devices: sbdDevicesFactory.buildList(3),
    resources: clusterResourceFactory.buildList(2, {
      node: faker.helpers.arrayElement(nodeNames),
    }),
    maintenance_mode: false,
  };
});

export const clusteredSapInstanceFactory = Factory.define(() => ({
  sid: generateSid(),
  instance_number: faker.number.int({ min: 10, max: 99 }).toString(),
}));

export const clusterFactory = Factory.define(({ sequence, params }) => {
  const { type = 'hana_scale_up' } = params;

  const details = (() => {
    switch (type) {
      case 'ascs_ers':
        return ascsErsClusterDetailsFactory.build(params.details);
      case 'hana_scale_up':
      case 'hana_scale_out':
      default:
        return hanaClusterDetailsFactory.build(params.details);
    }
  })();

  return {
    id: faker.string.uuid(),
    name: `${faker.person.firstName()}_${sequence}`,
    sap_instances: clusteredSapInstanceFactory.buildList(1),
    hosts_number: faker.number.int(),
    resources_number: faker.number.int(),
    type: clusterTypeEnum(),
    health: healthEnum(),
    selected_checks: [],
    provider: cloudProviderEnum(),
    cib_last_written: format(faker.date.recent(), 'EEE MMM d h:mm:ss yyyy'),
    details,
  };
});

export const buildHostsFromAscsErsClusterDetails = (details) =>
  details.sap_systems
    .flatMap(({ nodes }) => nodes)
    .map(({ name }) => hostFactory.build({ hostname: name }));

export const buildSapSystemsFromAscsErsClusterDetails = (details) =>
  details.sap_systems.map(({ sid }) => sapSystemFactory.build({ sid }));
