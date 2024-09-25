import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import {
  ACTIVITY_TYPES,
  RESOURCE_TAGGING,
  RESOURCE_UNTAGGING,
  ACTIVITY_LOG_LEVELS,
  resourceTypes,
} from '@lib/model/activityLog';

import { randomObjectFactory } from '.';

const taggableResourceTypes = resourceTypes;

const resourceNameEnrichingTagging = (resourceType) => {
  switch (resourceType) {
    case 'host':
      return {
        hostname: faker.lorem.word(),
      };
    case 'cluster':
      return {
        name: faker.lorem.word(),
      };
    case 'database':
    case 'sap_system':
      return {
        sid: faker.lorem.word(),
      };
    default:
      return {};
  }
};

export const taggingMetadataFactory = Factory.define(({ params }) => {
  const resourceType =
    params.resource_type || faker.helpers.arrayElement(taggableResourceTypes);

  return {
    resource_id: faker.string.uuid(),
    resource_type: resourceType,
    added_tag: faker.lorem.word(),
    ...resourceNameEnrichingTagging(resourceType),
  };
});

export const untaggingMetadataFactory = Factory.define(({ params }) => {
  const resourceType =
    params.resource_type || faker.helpers.arrayElement(taggableResourceTypes);

  return {
    resource_id: faker.string.uuid(),
    resource_type: resourceType,
    removed_tag: faker.lorem.word(),
    ...resourceNameEnrichingTagging(resourceType),
  };
});

const metadataForActivity = (activityType) => {
  switch (activityType) {
    case RESOURCE_TAGGING:
      return taggingMetadataFactory.build();
    case RESOURCE_UNTAGGING:
      return untaggingMetadataFactory.build();
    default:
      return randomObjectFactory.build();
  }
};

export const activityLogEntryFactory = Factory.define(({ params }) => {
  const activityType =
    params.type || faker.helpers.arrayElement(ACTIVITY_TYPES);
  const metadata = params.metadata || metadataForActivity(activityType);

  return {
    id: faker.string.uuid(),
    actor: faker.internet.userName(),
    type: activityType,
    occurred_on: faker.date.anytime(),
    metadata,
    level: faker.helpers.arrayElement(ACTIVITY_LOG_LEVELS),
  };
});
