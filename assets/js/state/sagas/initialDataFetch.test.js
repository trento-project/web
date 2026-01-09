import { runSaga } from 'redux-saga';


const runInitialDataFetch = async () => {
  const { initialDataFetch } = await import('./index');
  const { get } = require('@lib/network');

  const task = runSaga(
    { dispatch: () => { }, getState: () => ({ user: { password_change_requested: false } }) },
    initialDataFetch
  );

  const resolved = await Promise.race([
    task.toPromise(),
    new Promise((resolve) => setTimeout(() => resolve('timeout'), 500)),
  ]);

  expect(resolved).not.toBe('timeout');

  return { task, get };
};


describe('initialDataFetch saga', () => {
  beforeEach(() => {
    jest.resetModules();
    global.window = global.window || {};

    // Mock network get and forked sagas so the main saga completes fast
    jest.doMock('@lib/network', () => ({ get: jest.fn(() => Promise.resolve({ data: [] })) }));
    jest.doMock('@state/sagas/settings', () => ({ *checkApiKeyExpiration() { } }));
    jest.doMock('@state/sagas/user', () => ({ *checkUserPasswordChangeRequested() { } }));
    jest.doMock('@state/sagas/hosts', () => ({
      markDeregisterableHosts: jest.fn(),
      watchHostEvents: jest.fn(),
    }));
  });

  it('fetches all initial endpoints when basePath is /', async () => {
    delete global.window.basePath;
    const { task, get } = await runInitialDataFetch();

    const calls = get.mock.calls.map((c) => c[0]);
    expect(calls).toContain('/sap_systems/health');
    expect(calls).toContain('/hosts');
    expect(calls).toContain('/clusters');
    expect(calls).toContain('/sap_systems');
    expect(calls).toContain('/databases');

    // ensure the requests happen in the expected order
    expect(calls.indexOf('/sap_systems/health')).toBeLessThan(calls.indexOf('/hosts'));
    expect(calls.indexOf('/hosts')).toBeLessThan(calls.indexOf('/clusters'));
    expect(calls.indexOf('/clusters')).toBeLessThan(calls.indexOf('/sap_systems'));
    expect(calls.indexOf('/sap_systems')).toBeLessThan(calls.indexOf('/databases'));

    // check that clusters call has the correct baseURL
    const clustersCall = get.mock.calls.find((c) => c[0] === '/clusters');
    expect(clustersCall[1]).toEqual({ baseURL: '/api/v2' });

    const hostsSaga = require('@state/sagas/hosts');
    expect(hostsSaga.markDeregisterableHosts).toHaveBeenCalledWith([]);

    task.cancel();
  });


  it('fetches all initial endpoints when basePath is a subpath', async () => {
    global.window.basePath = "/trento";

    const { task, get } = await runInitialDataFetch();

    const calls = get.mock.calls.map((c) => c[0]);
    expect(calls).toContain('/sap_systems/health');
    expect(calls).toContain('/hosts');
    expect(calls).toContain('/clusters');
    expect(calls).toContain('/sap_systems');
    expect(calls).toContain('/databases');

    // ensure the requests happen in the expected order
    expect(calls.indexOf('/sap_systems/health')).toBeLessThan(calls.indexOf('/hosts'));
    expect(calls.indexOf('/hosts')).toBeLessThan(calls.indexOf('/clusters'));
    expect(calls.indexOf('/clusters')).toBeLessThan(calls.indexOf('/sap_systems'));
    expect(calls.indexOf('/sap_systems')).toBeLessThan(calls.indexOf('/databases'));

    // check that clusters call has the correct baseURL
    const clustersCall = get.mock.calls.find((c) => c[0] === '/clusters');
    expect(clustersCall[1]).toEqual({ baseURL: '/trento/api/v2' });

    const hostsSaga = require('@state/sagas/hosts');
    expect(hostsSaga.markDeregisterableHosts).toHaveBeenCalledWith([]);

    task.cancel();
  });


});
