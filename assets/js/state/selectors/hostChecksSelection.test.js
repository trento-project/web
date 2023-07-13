import { getCheckSelection } from './hostChecksSelection';

describe('Checks Selection selector', () => {
  it('should get the state of the check selection', () => {
    expect(
      getCheckSelection()({
        hostChecksSelection: {
          saving: false,
        },
      })
    ).toEqual({
      saving: false,
    });
  });
});
