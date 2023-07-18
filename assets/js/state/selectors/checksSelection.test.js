import { faker } from '@faker-js/faker';
import {
  getHostCheckSelection,
  getClusterCheckSelection,
} from './checksSelection';

describe('Checks Selection selector', () => {
  it(`should get a host's check selection state`, () => {
    const hostID = faker.datatype.uuid();
    expect(
      getHostCheckSelection(hostID)({
        checksSelection: {
          host: {
            [faker.datatype.uuid()]: { status: 'SUCCESSFULLY_SAVED' },
            [hostID]: { status: 'SAVING' },
          },
        },
      })
    ).toEqual({ status: 'SAVING' });
  });

  it(`should not get a host's check selection state if not present`, () => {
    const hostWithoutSelection = faker.datatype.uuid();
    expect(
      getHostCheckSelection(hostWithoutSelection)({
        checksSelection: {
          host: {
            [faker.datatype.uuid()]: { status: 'SUCCESSFULLY_SAVED' },
            [faker.datatype.uuid()]: { status: 'SAVING' },
          },
        },
      })
    ).toEqual({});
  });

  it(`should get a cluster's check selection state`, () => {
    const clusterID = faker.datatype.uuid();
    expect(
      getClusterCheckSelection(clusterID)({
        checksSelection: {
          cluster: {
            [faker.datatype.uuid()]: { status: 'SUCCESSFULLY_SAVED' },
            [clusterID]: { status: 'SAVING' },
          },
        },
      })
    ).toEqual({ status: 'SAVING' });
  });

  it(`should not get a cluster's check selection state if not present`, () => {
    const clustertWithoutSelection = faker.datatype.uuid();
    expect(
      getClusterCheckSelection(clustertWithoutSelection)({
        checksSelection: {
          cluster: {
            [faker.datatype.uuid()]: { status: 'SUCCESSFULLY_SAVED' },
            [faker.datatype.uuid()]: { status: 'SAVING' },
          },
        },
      })
    ).toEqual({});
  });
});
