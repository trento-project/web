jest.mock('phoenix', () => ({
  Socket: jest.fn().mockImplementation((endpoint, opts) => ({
    endpoint,
    opts,
    onError: jest.fn(),
    connect: jest.fn(),
  })),
}));

describe('initSocketConnection', () => {
  beforeEach(() => {
    jest.resetModules();

    // Ensure a clean window/localStorage
    global.window = global.window || {};
    global.window.localStorage = global.window.localStorage || {
      storage: {},
      getItem(key) {
        return this.storage[key] || null;
      },
      setItem(key, value) {
        this.storage[key] = value;
      },
      removeItem(key) {
        delete this.storage[key];
      },
    };
  });

  afterEach(() => {
    delete global.window.basePath;
    global.window.localStorage.storage = {};
  });

  it('uses /socket when no basePath is set and connects', () => {
    // import happens above; call the init function
    const { initSocketConnection } = require('./socket');
    initSocketConnection();

    const created = require('phoenix').Socket.mock.results[0].value;

    expect(created).not.toBeNull();
    expect(created.endpoint).toBe('/socket');
    expect(created.connect).toHaveBeenCalled();
  });

  it('prepends window.basePath to the socket endpoint when set', () => {
    global.window.basePath = '/trento';

    const { initSocketConnection } = require('./socket');
    initSocketConnection();

    const created = require('phoenix').Socket.mock.results[0].value;

    expect(created.endpoint).toBe('/trento/socket');
    expect(created.connect).toHaveBeenCalled();
  });

  it('params function reads current access token from localStorage', () => {
    window.localStorage.setItem('access_token', 'first');

    const { initSocketConnection } = require('./socket');
    initSocketConnection();

    const created = require('phoenix').Socket.mock.results[0].value;

    expect(typeof created.opts.params).toBe('function');
    expect(created.opts.params()).toEqual({ access_token: 'first' });

    // Update token and ensure params reads the new value
    window.localStorage.setItem('access_token', 'second');
    expect(created.opts.params()).toEqual({ access_token: 'second' });
  });
});
