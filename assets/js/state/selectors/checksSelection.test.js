import { faker } from '@faker-js/faker';
import { getHostCheckSelection } from './checksSelection';

describe('Checks Selection selector', () => {
  it(`should get a host's check selection state`, () => {
    const hostID = faker.datatype.uuid();
    expect(
      getHostCheckSelection(hostID)({
        checksSelection: {
          host: {
            [faker.datatype.uuid()]: { status: 'successfully_saved' },
            [hostID]: { status: 'saving' },
          },
        },
      })
    ).toEqual({ status: 'saving' });
  });

  it(`should not get a host's check selection state if not present`, () => {
    const hostWithoutSelection = faker.datatype.uuid();
    expect(
      getHostCheckSelection(hostWithoutSelection)({
        checksSelection: {
          host: {
            [faker.datatype.uuid()]: { status: 'successfully_saved' },
            [faker.datatype.uuid()]: { status: 'saving' },
          },
        },
      })
    ).toEqual({});
  });
});
