import { faker } from '@faker-js/faker';
import { pick } from 'lodash';

import { ASCS_ERS, HANA_SCALE_UP } from '@lib/model/clusters';

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

  it('should build and env for HANA clusters', () => {
    const payload = {
      cluster_type: HANA_SCALE_UP,
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
      'architecture_type',
    ]);

    const env = buildEnv(payload);

    expect(env).toEqual(expectedPayload);
  });
});
