import { faker } from '@faker-js/faker';
import {
  isSaving,
  isSuccessfullySaved,
  isSavingFailed,
} from './checksSelection';

describe('Checks Selection selector', () => {
  it(`should detect a target's status`, () => {
    const savingHostSelection = faker.string.uuid();
    const successfullySavedHostSelection = faker.string.uuid();
    const savingFailedHostSelection = faker.string.uuid();

    const savingClusterSelection = faker.string.uuid();
    const successfullySavedClusterSelection = faker.string.uuid();
    const savingFailedClusterSelection = faker.string.uuid();

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
    expect(isSaving('host', faker.string.uuid())(state)).toBe(false);
    expect(isSaving('cluster', faker.string.uuid())(state)).toBe(false);

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
    expect(isSuccessfullySaved('host', faker.string.uuid())(state)).toBe(false);
    expect(isSuccessfullySaved('cluster', faker.string.uuid())(state)).toBe(
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
    expect(isSavingFailed('host', faker.string.uuid())(state)).toBe(false);
    expect(isSavingFailed('cluster', faker.string.uuid())(state)).toBe(false);
  });
});
