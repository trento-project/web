import sapSystemsReducer, {
  removeSAPSystem,
  upsertApplicationInstances,
  updateApplicationInstanceHost,
  updateApplicationInstanceHealth,
  updateApplicationInstanceAbsentAt,
  removeApplicationInstance,
  updateSAPSystem,
  setApplicationInstanceDeregistering,
  unsetApplicationInstanceDeregistering,
} from '@state/sapSystems';
import {
  sapSystemFactory,
  sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories/sapSystems';
import { databaseInstanceFactory } from '@lib/test-utils/factories/databases';
import { faker } from '@faker-js/faker';

describe('SAP Systems reducer', () => {
  it('should remove SAP system from state', () => {
    const [sapSystem1, sapSystem2] = sapSystemFactory.buildList(2);
    const sapSystem1ApplicationInstances =
      sapSystemApplicationInstanceFactory.buildList({
        sap_system_id: sapSystem1.id,
      });
    const sapSystem1DatabaseInstances = databaseInstanceFactory.buildList({
      sap_system_id: sapSystem1.id,
    });
    const sapSystem2ApplicationInstances =
      sapSystemApplicationInstanceFactory.buildList({
        sap_system_id: sapSystem2.id,
      });
    const sapSystem2DatabaseInstances = databaseInstanceFactory.buildList({
      sap_system_id: sapSystem2.id,
    });

    const initialState = {
      sapSystems: [sapSystem1, sapSystem2],
      applicationInstances: sapSystem1ApplicationInstances.concat(
        sapSystem2ApplicationInstances
      ),
      databaseInstances: sapSystem1DatabaseInstances.concat(
        sapSystem2DatabaseInstances
      ),
    };

    const action = removeSAPSystem(sapSystem1);

    const expectedState = {
      sapSystems: [sapSystem2],
      applicationInstances: sapSystem2ApplicationInstances,
      databaseInstances: sapSystem2DatabaseInstances,
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

  it('should change the host of an application instance', () => {
    const instance = sapSystemApplicationInstanceFactory.build();

    const initialState = {
      applicationInstances: [instance],
    };

    const newHostId = faker.string.uuid();
    const instanceToUpdate = {
      sap_system_id: instance.sap_system_id,
      instance_number: instance.instance_number,
      old_host_id: instance.host_id,
      new_host_id: newHostId,
    };
    const action = updateApplicationInstanceHost(instanceToUpdate);

    const state = sapSystemsReducer(initialState, action);
    expect(state.applicationInstances[0].host_id).toEqual(newHostId);
  });

  it('should update the health of an application instance', () => {
    const instance = sapSystemApplicationInstanceFactory.build();
    const newHealth = 'newHealth';

    const initialState = {
      applicationInstances: [instance],
    };

    const instanceToUpdate = {
      sap_system_id: instance.sap_system_id,
      instance_number: instance.instance_number,
      host_id: instance.host_id,
      health: newHealth,
    };
    const action = updateApplicationInstanceHealth(instanceToUpdate);

    const expectedState = {
      applicationInstances: [{ ...instance, health: newHealth }],
    };

    expect(sapSystemsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should update the absent_at field of an application instance', () => {
    const instance = sapSystemApplicationInstanceFactory.build();
    const absentAt = Date.now();

    const initialState = {
      applicationInstances: [instance],
    };

    const instanceToUpdate = {
      ...instance,
      absent_at: absentAt,
    };

    const action = updateApplicationInstanceAbsentAt(instanceToUpdate);

    const expectedState = {
      applicationInstances: [
        {
          ...instance,
          absent_at: absentAt,
        },
      ],
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

  it('should upsert application instances', () => {
    const initialInstances = sapSystemApplicationInstanceFactory.buildList(2);

    const initialState = {
      applicationInstances: initialInstances,
    };

    const updatedInstance = {
      ...initialState.applicationInstances[0],
      instance_hostname: 'my_name_has_changed',
    };
    const newInstance = sapSystemApplicationInstanceFactory.build();
    const newInstances = [updatedInstance, newInstance];

    const action = upsertApplicationInstances(newInstances);

    const expectedState = {
      applicationInstances: [initialInstances[1], ...newInstances],
    };

    expect(sapSystemsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should set application instance in deregistering state', () => {
    const instance = sapSystemApplicationInstanceFactory.build();

    const initialState = {
      applicationInstances: [instance],
    };

    const action = setApplicationInstanceDeregistering(instance);

    const expectedState = {
      applicationInstances: [
        {
          ...instance,
          deregistering: true,
        },
      ],
    };

    expect(sapSystemsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should remove deregistering state from application instance', () => {
    const instance = sapSystemApplicationInstanceFactory.build();

    const initialState = {
      applicationInstances: [instance],
    };

    const action = unsetApplicationInstanceDeregistering(instance);

    const expectedState = {
      applicationInstances: [
        {
          ...instance,
          deregistering: false,
        },
      ],
    };

    expect(sapSystemsReducer(initialState, action)).toEqual(expectedState);
  });
});
