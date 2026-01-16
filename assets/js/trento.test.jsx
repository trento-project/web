describe('trento bootstrap', () => {
  // Helper to mock react-router; when `captureRoutes` is provided,
  // `createBrowserRouter` will be passed the processed routes array and we'll capture it.
  function mockReactRouter({ captureRoutes } = {}) {
    jest.doMock('react-router', () => {
      const actual = jest.requireActual('react-router');
      return {
        ...actual,
        // Use the actual createRoutesFromElements implementation so the first
        // argument passed to createBrowserRouter is a routes array we can inspect.
        createRoutesFromElements: actual.createRoutesFromElements,
        createBrowserRouter: jest.fn((routes, options) => {
          if (captureRoutes) captureRoutes(routes);
          return { routes, options };
        }),
        Route: actual.Route,
        RouterProvider: actual.RouterProvider,
        Outlet: actual.Outlet,
      };
    });
  }

  beforeEach(() => {
    jest.resetModules();
    global.window = global.window || {};
  });

  afterEach(() => {
    delete global.window.basePath;
    jest.resetModules();
  });

  const expectedPaths = [
    '/session/new',
    '/',
    'profile',
    'hosts',
    'hosts/:hostID/settings',
    'hosts/:hostID/saptune',
    'clusters',
    'sap_systems',
    'databases',
    'catalog',
    'settings',
    'about',
    'hosts/:hostID',
    'sap_systems/:id',
    'databases/:id',
    'clusters/:clusterID',
    'clusters/:clusterID/settings',
    'clusters/:targetID/executions/last',
    'hosts/:targetID/executions/last',
    'clusters/:targetID/executions/last/:checkID/:resultTargetType/:resultTargetName',
    'hosts/:targetID/executions/last/:checkID/:resultTargetType/:resultTargetName',
    'hosts/:hostID/patches',
    'hosts/:hostID/packages',
    'hosts/:hostID/patches/:advisoryID',
    'activity_log',
    'users',
    'users/new',
    'users/:userID/edit',
    '*',
  ];

  async function collectRoutes({ ssoEnabled = false } = {}) {
    let capturedRoutes = null;

    // Capture the processed routes array passed to createBrowserRouter
    mockReactRouter({ captureRoutes: (routes) => (capturedRoutes = routes) });

    // Optionally enable SSO for this import
    jest.doMock('@lib/auth/config', () => ({
      isSingleSignOnEnabled: () => ssoEnabled,
      getSingleSignOnCallbackUrl: () => '/session/oidc/callback',
    }));

    await import('./trento.jsx');

    if (!capturedRoutes) return [];

    function collectPathsFromRoutes(routes, acc = []) {
      routes.forEach((r) => {
        if (r.path) acc.push(r.path);
        if (r.children) collectPathsFromRoutes(r.children, acc);
      });
      return acc;
    }

    return collectPathsFromRoutes(capturedRoutes);
  }

  it('should include all declared application routes (SSO disabled)', async () => {
    const paths = await collectRoutes({ ssoEnabled: false });

    expectedPaths.forEach((p) => {
      expect(paths).toContain(p);
    });

    expect(paths).not.toContain('/session/oidc/callback');
  });

  it('should include SSO callback route when SSO is enabled', async () => {
    const paths = await collectRoutes({ ssoEnabled: true });

    expectedPaths.forEach((p) => {
      expect(paths).toContain(p);
    });

    expect(paths).toContain('/session/oidc/callback');
  });

  it('should configure router basename when not using a subpath', async () => {
    mockReactRouter();

    await import('./trento.jsx');

    const rr = require('react-router');
    expect(rr.createBrowserRouter).toHaveBeenCalledWith(expect.anything(), {
      basename: '',
    });
  });

  it('should configure router basename when using a subpath', async () => {
    mockReactRouter();

    // Set basePath
    global.window.basePath = '/trento';

    await import('./trento.jsx');

    const rr = require('react-router');
    expect(rr.createBrowserRouter).toHaveBeenCalledWith(expect.anything(), {
      basename: '/trento',
    });
  });

  it('should set networkClient when not using a subpath', async () => {
    delete global.window.basePath;

    await import('./trento.jsx');

    const { networkClient } = await import('@lib/network');

    expect(networkClient.defaults.baseURL).toBe('/api/v1');
  });

  it('should set networkClient when using a subpath', async () => {
    // Set basePath
    global.window.basePath = '/trento';

    await import('./trento.jsx');

    const { networkClient } = await import('@lib/network');

    expect(networkClient.defaults.baseURL).toBe('/trento/api/v1');
  });
});
