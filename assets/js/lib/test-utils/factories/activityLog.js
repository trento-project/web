import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import {
  ACTIVITY_TYPES,
  RESOURCE_TAGGING,
  RESOURCE_UNTAGGING,
  ACTIVITY_LOG_LEVELS,
} from '@lib/model/activityLog';
import { randomObjectFactory } from '.';

const taggableResourceTypes = ['host', 'cluster', 'database', 'sap_system'];

export const taggingMetadataFactory = Factory.define(() => ({
  resource_id: faker.string.uuid(),
  resource_type: faker.helpers.arrayElement(taggableResourceTypes),
  added_tag: faker.lorem.word(),
}));

export const untaggingMetadataFactory = Factory.define(() => ({
  resource_id: faker.string.uuid(),
  resource_type: faker.helpers.arrayElement(taggableResourceTypes),
  removed_tag: faker.lorem.word(),
}));

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

export const activityLogEntryFactory = Factory.define(() => {
  const activityType = faker.helpers.arrayElement(ACTIVITY_TYPES);

  return {
    id: faker.string.uuid(),
    actor: faker.internet.userName(),
    type: activityType,
    occurred_on: faker.date.anytime(),
    metadata: metadataForActivity(activityType),
    level: faker.helpers.arrayElement(ACTIVITY_LOG_LEVELS),
  };
});
