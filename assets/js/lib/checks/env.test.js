import { faker } from '@faker-js/faker';
import { pick } from 'lodash';

import {
  ASCS_ERS,
  HANA_SCALE_UP,
  COST_OPT_SCENARIO,
  PERFORMANCE_SCENARIO,
} from '@lib/model/clusters';

import { buildEnv } from '.';

describe('buildEnv', () => {
  it('should build and env for ASCS/ERS clusters', () => {
    const payload = {
      cluster_type: ASCS_ERS,
      provider: faker.color.rgb(),
      target_type: faker.hacker.noun(),
      ensa_version: faker.number.int(),
      filesystem_type: faker.animal.dog(),
      architecture_type: faker.hacker.noun(),
    };

    const expectedPayload = pick(payload, [
      'cluster_type',
      'provider',
      'target_type',
      'ensa_version',
      'filesystem_type',
    ]);

    const env = buildEnv(payload);

    expect(env).toEqual(expectedPayload);
  });

  it('should build and env for HANA sclae up performance clusters', () => {
    const payload = {
      cluster_type: HANA_SCALE_UP,
      hana_scenario: PERFORMANCE_SCENARIO,
      provider: faker.color.rgb(),
      target_type: faker.hacker.noun(),
      ensa_version: faker.number.int(),
      filesystem_type: faker.animal.dog(),
      architecture_type: faker.hacker.noun(),
    };

    const expectedPayload = pick(payload, [
      'cluster_type',
      'hana_scenario',
      'provider',
      'target_type',
      'architecture_type',
    ]);

    const env = buildEnv(payload);

    expect(env).toEqual(expectedPayload);
  });

  it('should build and env for HANA scale up cost opt clusters', () => {
    const payload = {
      cluster_type: HANA_SCALE_UP,
      hana_scenario: COST_OPT_SCENARIO,
      provider: faker.color.rgb(),
      target_type: faker.hacker.noun(),
      ensa_version: faker.number.int(),
      filesystem_type: faker.animal.dog(),
      architecture_type: faker.hacker.noun(),
    };

    const expectedPayload = pick(payload, [
      'cluster_type',
      'hana_scenario',
      'provider',
      'target_type',
      'architecture_type',
    ]);

    const env = buildEnv(payload);

    expect(env).toEqual(expectedPayload);
  });
});
