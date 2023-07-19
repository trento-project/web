import { faker } from '@faker-js/faker';
import {
  isSaving,
  isSuccessfullySaved,
  isSavingFailed,
} from './checksSelection';

describe('Checks Selection selector', () => {
  it(`should detect a target's status`, () => {
    const savingHostSelection = faker.datatype.uuid();
    const successfullySavedHostSelection = faker.datatype.uuid();
    const savingFailedHostSelection = faker.datatype.uuid();

    const savingClusterSelection = faker.datatype.uuid();
    const successfullySavedClusterSelection = faker.datatype.uuid();
    const savingFailedClusterSelection = faker.datatype.uuid();

    const state = {
      checksSelection: {
        host: {
          [savingHostSelection]: { status: 'SAVING' },
          [successfullySavedHostSelection]: { status: 'SUCCESSFULLY_SAVED' },
          [savingFailedHostSelection]: { status: 'SAVING_FAILED' },
        },
        cluster: {
          [savingClusterSelection]: { status: 'SAVING' },
          [successfullySavedClusterSelection]: { status: 'SUCCESSFULLY_SAVED' },
          [savingFailedClusterSelection]: { status: 'SAVING_FAILED' },
        },
      },
    };

    expect(isSaving('host', savingHostSelection)(state)).toBe(true);
    expect(isSaving('cluster', savingClusterSelection)(state)).toBe(true);
    expect(isSaving('host', successfullySavedHostSelection)(state)).toBe(false);
    expect(isSaving('cluster', successfullySavedClusterSelection)(state)).toBe(
      false
    );
    expect(isSaving('host', faker.datatype.uuid())(state)).toBe(false);
    expect(isSaving('cluster', faker.datatype.uuid())(state)).toBe(false);

    expect(
      isSuccessfullySaved('host', successfullySavedHostSelection)(state)
    ).toBe(true);
    expect(
      isSuccessfullySaved('cluster', successfullySavedClusterSelection)(state)
    ).toBe(true);
    expect(isSuccessfullySaved('host', savingHostSelection)(state)).toBe(false);
    expect(isSuccessfullySaved('cluster', savingClusterSelection)(state)).toBe(
      false
    );
    expect(isSuccessfullySaved('host', faker.datatype.uuid())(state)).toBe(
      false
    );
    expect(isSuccessfullySaved('cluster', faker.datatype.uuid())(state)).toBe(
      false
    );

    expect(isSavingFailed('host', savingFailedHostSelection)(state)).toBe(true);
    expect(isSavingFailed('cluster', savingFailedClusterSelection)(state)).toBe(
      true
    );
    expect(isSavingFailed('host', savingHostSelection)(state)).toBe(false);
    expect(isSavingFailed('cluster', savingClusterSelection)(state)).toBe(
      false
    );
    expect(isSavingFailed('host', faker.datatype.uuid())(state)).toBe(false);
    expect(isSavingFailed('cluster', faker.datatype.uuid())(state)).toBe(false);
  });
});
