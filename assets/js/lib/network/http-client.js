// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

// A lightweight, fetch-based HTTP client that preserves the narrow axios
// surface this codebase relies on: get/post/put/patch/delete with baseURL,
// params, headers; axios-shaped responses and errors; request/response
// interceptors; and an opt-in 401 refresh-and-retry mechanism.
//
// No external dependencies — uses browser-native fetch (Chrome, Firefox,
// Edge on Windows all ship fetch, URLSearchParams, Headers, …).

// ---------------------------------------------------------------------------
// URL & header helpers
// ---------------------------------------------------------------------------

function combineUrls(baseURL, url) {
  if (baseURL) {
    return `${baseURL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
  }
  return url;
}

function buildUrl(config) {
  const baseURL = config.baseURL !== undefined ? config.baseURL : '';
  let url = combineUrls(baseURL, config.url || '');

  if (config.params) {
    const search = new URLSearchParams(config.params).toString();
    if (search) {
      url = `${url}?${search}`;
    }
  }
  return url;
}

// Build a case-insensitive header container from a fetch Headers instance,
// a plain object, or nothing. Supports both .get('key') and direct
// property access (headers.etag, headers.Authorization, …) so that
// consumers can use whichever casing the server or axios used.
function createHeaders(source) {
  const entries = new Map();
  if (source) {
    if (typeof source.forEach === 'function') {
      source.forEach((value, key) => entries.set(key.toLowerCase(), value));
    } else {
      for (const [key, value] of Object.entries(source)) {
        entries.set(key.toLowerCase(), value);
      }
    }
  }

  const container = {
    get(name) {
      return entries.get(name.toLowerCase());
    },
    forEach(callback) {
      entries.forEach((value, key) => callback(value, key));
    },
  };

  // Proxy enables direct case-insensitive property access such as
  // `headers.etag` or `headers.Authorization`.
  return new Proxy(container, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop === 'string') return entries.get(prop.toLowerCase());
      return undefined;
    },
    has(_target, prop) {
      if (typeof prop === 'string') return entries.has(prop.toLowerCase());
      return false;
    },
  });
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

// Dedicated, private function that converts a non-2xx HTTP response into an
// axios-compatible error object. Centralised so the error shape is explicit
// and can be swapped independently in the future.
function toHttpError(response) {
  const error = new Error(`Request failed with status code ${response.status}`);
  error.config = response.config;
  error.response = {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data: response.data,
  };
  error.request = {};
  error.isAxiosError = true;
  return error;
}

// Dedicated, private function that converts a network-level failure (fetch
// rejection) into an axios-compatible error object — no `.response` property,
// matching axios' behaviour when the request never reaches the server.
function toNetworkError(config) {
  const error = new Error('Network Error');
  error.config = config;
  error.request = {};
  error.isAxiosError = true;
  return error;
}

// ---------------------------------------------------------------------------
// Default transport (uses browser-native fetch)
// ---------------------------------------------------------------------------

async function fetchTransport(config) {
  const url = buildUrl(config);
  const method = config.method;

  const headers = { ...(config.headers || {}) };

  const options = { method, headers };

  if (config.data !== undefined && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(config.data);
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(url, options);
  const text = await response.text();
  let data;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return {
    status: response.status,
    statusText: response.statusText,
    headers: createHeaders(response.headers),
    data,
  };
}

// ---------------------------------------------------------------------------
// Response interceptor runner
// ---------------------------------------------------------------------------

function runResponseInterceptors(instance, promise) {
  let chain = promise;
  for (const interceptor of instance.interceptors.response.handlers) {
    chain = chain.then(interceptor.onFulfilled, interceptor.onRejected);
  }
  return chain;
}

// ---------------------------------------------------------------------------
// Internal request execution (transport + optional refresh-and-retry)
// ---------------------------------------------------------------------------

async function executeRequest(instance, config) {
  const transportResult = await instance._transport(config);
  const response = { ...transportResult, config };

  // 401 → refresh token, update auth header, retry once
  if (response.status === 401 && instance._refreshAuthLogic) {
    const updatedConfig = await instance._refreshAuthLogic({
      ...config,
      headers: { ...config.headers },
    });
    const retryResult = await instance._transport(updatedConfig);
    const retryResponse = { ...retryResult, config: updatedConfig };

    if (retryResponse.status < 200 || retryResponse.status >= 300) {
      throw toHttpError(retryResponse);
    }
    return retryResponse;
  }

  if (response.status < 200 || response.status >= 300) {
    throw toHttpError(response);
  }

  return response;
}

// ---------------------------------------------------------------------------
// Public factory
// ---------------------------------------------------------------------------

/**
 * Create a fetch-backed HTTP client with an axios-compatible surface.
 *
 * @param {object}  [options]
 * @param {string}  [options.baseURL='']      – prepended to every request url
 * @param {function}[options.transport]       – custom transport (defaults to fetch)
 * @param {function}[options.refreshAuthLogic]– async fn(config) → config; called
 *                                               on 401 to refresh the token and
 *                                               update the request config before
 *                                               a single retry.
 * @returns {object} client instance with get/post/put/patch/delete methods
 *                   and interceptors.request.use / interceptors.response.use.
 */
export function createClient({
  baseURL = '',
  transport = fetchTransport,
  refreshAuthLogic = null,
} = {}) {
  const instance = {
    baseURL,
    _transport: transport,
    _refreshAuthLogic: refreshAuthLogic,

    interceptors: {
      request: {
        handlers: [],
        use(fn) {
          this.handlers.push(fn);
        },
      },
      response: {
        handlers: [],
        use(onFulfilled, onRejected) {
          this.handlers.push({ onFulfilled, onRejected });
        },
      },
    },

    get(url, config) {
      return dispatch(instance, 'GET', url, undefined, config);
    },
    post(url, data, config) {
      return dispatch(instance, 'POST', url, data, config);
    },
    put(url, data, config) {
      return dispatch(instance, 'PUT', url, data, config);
    },
    patch(url, data, config) {
      return dispatch(instance, 'PATCH', url, data, config);
    },
    delete(url, config) {
      return dispatch(instance, 'DELETE', url, undefined, config);
    },
  };

  return instance;
}

// ---------------------------------------------------------------------------
// Core dispatch — builds config, runs request interceptors, executes the
// request, and runs response interceptors.
// ---------------------------------------------------------------------------

async function dispatch(instance, method, url, data, config) {
  // Treat null/undefined config as empty (axios wrappers pass null by default).
  const safeConfig = config ?? {};
  // Build the final config, merging instance defaults with per-request values.
  const finalConfig = {
    ...safeConfig,
    url,
    baseURL:
      safeConfig.baseURL !== undefined ? safeConfig.baseURL : instance.baseURL,
    method,
    data,
    headers: { ...(safeConfig.headers || {}) },
    params: safeConfig.params,
  };

  // Run request interceptors (e.g., attach Bearer token).
  let processedConfig = finalConfig;
  try {
    for (const interceptor of instance.interceptors.request.handlers) {
      processedConfig = await interceptor(processedConfig);
    }
  } catch (e) {
    return runResponseInterceptors(instance, Promise.reject(e));
  }

  // Execute the request (transport + optional refresh-and-retry).
  try {
    const response = await executeRequest(instance, processedConfig);
    return runResponseInterceptors(instance, Promise.resolve(response));
  } catch (e) {
    if (e instanceof TypeError) {
      // fetch rejects with TypeError on network-level failures
      return runResponseInterceptors(
        instance,
        Promise.reject(toNetworkError(processedConfig))
      );
    }
    return runResponseInterceptors(instance, Promise.reject(e));
  }
}
