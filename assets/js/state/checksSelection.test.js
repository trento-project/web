import { faker } from '@faker-js/faker';
import checksSelectionReducer, {
  startSavingChecksSelection,
  setSavingSuccessful,
  setSavingFailed,
} from '@state/checksSelection';

describe('Checks Selection reducer', () => {
  const initialState = {
    host: {},
    cluster: {},
  };

  const scenarios = [
    {
      name: 'Host checks selection',
      targetID: faker.string.uuid(),
      targetType: 'host',
    },
    {
      name: 'Cluster checks selection',
      targetID: faker.string.uuid(),
      targetType: 'cluster',
    },
  ];

  it.each(scenarios)(
    '$name: should mark a check selection as saving',
    ({ targetID, targetType }) => {
      const action = startSavingChecksSelection({ targetID, targetType });

      const newState = checksSelectionReducer(initialState, action);

      expect(newState[targetType][targetID]).toEqual({ status: 'SAVING' });
    }
  );

  it.each(scenarios)(
    '$name: should mark a check selection as completed successfully',
    ({ targetID, targetType }) => {
      const action = setSavingSuccessful({ targetID, targetType });

      const newState = checksSelectionReducer(initialState, action);

      expect(newState[targetType][targetID]).toEqual({
        status: 'SUCCESSFULLY_SAVED',
      });
    }
  );

  it.each(scenarios)(
    '$name: should mark a check selection as completed with failure',
    ({ targetID, targetType }) => {
      const action = setSavingFailed({ targetID, targetType });

      const newState = checksSelectionReducer(initialState, action);

      expect(newState[targetType][targetID]).toEqual({
        status: 'SAVING_FAILED',
      });
    }
  );

  it.each([faker.lorem.word(4), faker.lorem.word(5), faker.lorem.word(6)])(
    'should ignore unsupported targets',
    (targetType) => {
      const state = {
        host: {
          [faker.string.uuid()]: { status: 'saving' },
          [faker.string.uuid()]: { status: 'saving_failed' },
        },
        cluster: {
          [faker.string.uuid()]: { status: 'successfully_saved' },
        },
      };

      [
        startSavingChecksSelection,
        setSavingSuccessful,
        setSavingFailed,
      ].forEach((actionFunction) => {
        const targetID = faker.string.uuid();
        const action = actionFunction({ targetID, targetType });

        const newState = checksSelectionReducer(state, action);

        expect(newState).toEqual(state);
      });
    }
  );
});
