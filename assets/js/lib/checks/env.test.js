import { faker } from '@faker-js/faker';
import { has } from 'lodash';

import { ASCS_ERS, HANA_SCALE_UP } from '@lib/model/clusters';

import { buildEnv } from '.';

describe('buildEnv', () => {
  it('should build and env with filesystem type and ensa version for ASCS/ERS clusters', () => {
    const payload = {
      cluster_type: ASCS_ERS,
      provider: faker.color.rgb(),
      target_type: faker.hacker.noun(),
      ensa_version: faker.number.int(),
      filesystem_type: faker.animal.dog(),
    };

    const env = buildEnv(payload);

    expect(env).toEqual(payload);
  });

  it('should build and env without filesystem type and ensa version for other clusters', () => {
    const payload = {
      cluster_type: HANA_SCALE_UP,
      provider: faker.color.rgb(),
      target_type: faker.hacker.noun(),
      ensa_version: faker.number.int(),
      filesystem_type: faker.animal.dog(),
    };

    const env = buildEnv(payload);

    expect(has(env, 'ensa_version')).toBe(false);
    expect(has(env, 'filesystem_type')).toBe(false);
  });
});
