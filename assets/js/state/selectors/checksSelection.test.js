import { getCheckSelection } from './checksSelection';

describe('Checks Selection selector', () => {
  it('should get the state of the check selection', () => {
    expect(
      getCheckSelection()({
        checksSelection: {
          saving: false,
          savingSuccess: false,
        },
      })
    ).toEqual({
      saving: false,
      savingSuccess: false,
    });
  });
});
