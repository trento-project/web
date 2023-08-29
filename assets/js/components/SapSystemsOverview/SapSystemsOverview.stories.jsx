import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  clusterFactory,
  hostFactory,
  sapSystemFactory,
} from '@lib/test-utils/factories';

import SapSystemsOverview from './SapSystemsOverview';

const sapSystems = sapSystemFactory.buildList(3);

const enrichedApplicationInstances = sapSystems[0].application_instances
  .concat(sapSystems[1].application_instances)
  .concat(sapSystems[2].application_instances)
  .map((instance) => {
    const cluster = clusterFactory.build();
    return {
      ...instance,
      host: {
        ...hostFactory.build({ id: instance.host_id, cluster_id: cluster.id }),
        cluster,
      },
    };
  });

const enrichedDatabaseInstances = sapSystems[0].database_instances
  .concat(sapSystems[1].database_instances)
  .concat(sapSystems[2].database_instances)
  .map((instance) => {
    const cluster = clusterFactory.build();
    return {
      ...instance,
      host: {
        ...hostFactory.build({ id: instance.host_id, cluster_id: cluster.id }),
        cluster,
      },
    };
  });

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'SapSystemsOverview',
  components: SapSystemsOverview,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  render: (args) => (
    <ContainerWrapper>
      <SapSystemsOverview {...args} />
    </ContainerWrapper>
  ),
};

export const SapSystems = {
  args: {
    sapSystems,
    applicationInstances: enrichedApplicationInstances,
    databaseInstances: enrichedDatabaseInstances,
    loading: false,
  },
};
