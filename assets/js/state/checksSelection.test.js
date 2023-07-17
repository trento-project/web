import { faker } from '@faker-js/faker';
import checksSelectionReducer, {
  startSavingChecksSelection,
  markSavingSuccessful,
  markSavingFailed,
} from '@state/checksSelection';

describe('Checks Selection reducer', () => {
  const initialState = {
    host: {},
    cluster: {},
  };

  const scenarios = [
    {
      name: 'Host checks selection',
      targetID: faker.datatype.uuid(),
      targetType: 'host',
    },
    {
      name: 'Cluster checks selection',
      targetID: faker.datatype.uuid(),
      targetType: 'cluster',
    },
  ];

  it.each(scenarios)(
    '$name: should mark a check selection as saving',
    ({ targetID, targetType }) => {
      const action = startSavingChecksSelection({ targetID, targetType });

      const newState = checksSelectionReducer(initialState, action);

      expect(newState[targetType][targetID]).toEqual({ status: 'saving' });
    }
  );

  it.each(scenarios)(
    '$name: should mark a check selection as completed successfully',
    ({ targetID, targetType }) => {
      const action = markSavingSuccessful({ targetID, targetType });

      const newState = checksSelectionReducer(initialState, action);

      expect(newState[targetType][targetID]).toEqual({
        status: 'successfully_saved',
      });
    }
  );

  it.each(scenarios)(
    '$name: should mark a check selection as completed with failure',
    ({ targetID, targetType }) => {
      const action = markSavingFailed({ targetID, targetType });

      const newState = checksSelectionReducer(initialState, action);

      expect(newState[targetType][targetID]).toEqual({
        status: 'saving_failed',
      });
    }
  );

  it.each([faker.lorem.word(4), faker.lorem.word(5), faker.lorem.word(6)])(
    'should ignore unsupported targets',
    (targetType) => {
      const state = {
        host: {
          [faker.datatype.uuid()]: { status: 'saving' },
          [faker.datatype.uuid()]: { status: 'saving_failed' },
        },
        cluster: {
          [faker.datatype.uuid()]: { status: 'successfully_saved' },
        },
      };

      [
        startSavingChecksSelection,
        markSavingSuccessful,
        markSavingFailed,
      ].forEach((actionFunction) => {
        const targetID = faker.datatype.uuid();
        const action = actionFunction({ targetID, targetType });

        const newState = checksSelectionReducer(state, action);

        expect(newState).toEqual(state);
      });
    }
  );
});
