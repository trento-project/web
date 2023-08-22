import { getAllInstances } from '.';

describe('getAllInstances selector', () => {
  it('should correctly merge and format applicationInstances and databaseInstances', () => {
    const state = {
      sapSystemsList: {
        applicationInstances: [
          { id: 1, name: 'APP1' },
          { id: 2, name: 'APP2' },
        ],
        databaseInstances: [
          { id: 3, name: 'DB1' },
          { id: 4, name: 'DB2' },
        ],
      },
    };

    const expectedOutput = [
      { id: 1, name: 'APP1', type: 'sap_systems' },
      { id: 2, name: 'APP2', type: 'sap_systems' },
      { id: 3, name: 'DB1', type: 'databases' },
      { id: 4, name: 'DB2', type: 'databases' },
    ];

    expect(getAllInstances()(state)).toEqual(expectedOutput);
  });
});
