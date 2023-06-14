import sapSystemsReducer, {
  removeSAPSystem,
  removeApplicationInstance,
  updateSAPSystem,
} from '@state/sapSystems';
import {
  sapSystemFactory,
  sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories/sapSystems';

describe('SAP Systems reducer', () => {
  it('should remove SAP system from state', () => {
    const [sapSystem1, sapSystem2] = sapSystemFactory.buildList(2);
    const initialState = {
      sapSystems: [sapSystem1, sapSystem2],
    };

    const action = removeSAPSystem(sapSystem1);

    const expectedState = {
      sapSystems: [sapSystem2],
    };

    expect(sapSystemsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should remove an application instance from state', () => {
    const [instance1, instance2] =
      sapSystemApplicationInstanceFactory.buildList(2);

    const initialState = {
      applicationInstances: [instance1, instance2],
    };

    const action = removeApplicationInstance(instance1);

    const expectedState = {
      applicationInstances: [instance2],
    };

    expect(sapSystemsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should update a SAP system data', () => {
    const changedIndex = 2;
    const sapSystems = sapSystemFactory.buildList(5);
    const initialState = {
      sapSystems,
    };

    const updateEvent = {
      id: sapSystems[changedIndex].id,
      ensa_version: 'new_version',
    };

    const expectedSapSystems = [...sapSystems];
    expectedSapSystems[changedIndex] = {
      ...sapSystems[changedIndex],
      ...updateEvent,
    };

    const action = updateSAPSystem(updateEvent);

    const expectedState = {
      sapSystems: expectedSapSystems,
    };

    expect(sapSystemsReducer(initialState, action)).toEqual(expectedState);
  });
});
