import { faker } from '@faker-js/faker';
import { hostFactory } from '@lib/test-utils/factories';
import { getHostSelectedChecks } from './host';

describe('host selector', () => {
  it('should return selected checks for a host', () => {
    const hostID1 = faker.datatype.uuid();
    const hostID2 = faker.datatype.uuid();
    const checkID1 = faker.datatype.uuid();
    const checkID2 = faker.datatype.uuid();
    const checks1 = [checkID1, checkID2];
    const checks2 = [];

    const host1 = hostFactory.build({
      id: hostID1,
      selected_checks: checks1,
    });

    const host2 = hostFactory.build({
      id: hostID2,
      selected_checks: checks2,
    });

    const state = {
      hostsList: {
        hosts: [host1, host2],
      },
    };

    expect(getHostSelectedChecks(hostID1)(state)).not.toEqual(checks2);
    expect(getHostSelectedChecks(hostID1)(state)).toEqual(checks1);
    expect(getHostSelectedChecks(hostID2)(state)).not.toEqual(checks1);
    expect(getHostSelectedChecks(hostID2)(state)).toEqual(checks2);
  });
});
