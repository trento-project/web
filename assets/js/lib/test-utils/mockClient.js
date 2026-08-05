// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

// A small test-only mock that mirrors the subset of the axios-mock-adapter
// API this codebase actually uses. It operates on client instances created
// by `createClient` (from @lib/network/http-client) by replacing the
// instance's internal `_transport` function.
//
// Supported API:
//   const mock = new MockAdapter(client);
//   mock.onGet(urlOrRegex[, body]).reply(status[, data]);
//   mock.onGet(url).replyOnce(status[, data]);
//   mock.onPost(url).networkError();
//   mock.reset();
//   mock.history.get[0].url / .data / .params / .headers
//
// Key behavioural note: persistent handlers (reply, not replyOnce) with the
// same URL + body REPLACE the previous one, matching axios-mock-adapter v2.
// replyOnce handlers are always appended so they can be stacked.

// ---------------------------------------------------------------------------
// Helpers (duplicated from http-client.js to keep the mock self-contained)
// ---------------------------------------------------------------------------

function combineUrls(baseURL, url) {
  if (baseURL) {
    return `${baseURL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
  }
  return url;
}

function isUrlMatching(url, required) {
  const noSlashUrl = url[0] === '/' ? url.substr(1) : url;
  const noSlashRequired = required[0] === '/' ? required.substr(1) : required;
  return noSlashUrl === noSlashRequired;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => deepEqual(a[key], b[key]));
}

function deepCopy(data) {
  if (data === undefined || data === null) return data;
  if (typeof data !== 'object') return data;
  return JSON.parse(JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// MockAdapter
// ---------------------------------------------------------------------------

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

class MockAdapter {
  constructor(client) {
    this.client = client;
    this._originalTransport = client._transport;
    this.reset();
    // Replace the client's transport so every request goes through the mock.
    client._transport = (config) => this._handleRequest(config);
  }

  // -- Handler registration --

  _createRequestApi(method, url, data) {
    const self = this;

    return {
      reply(status, responseData) {
        const isFn = typeof status === 'function';
        self._addHandler(method, {
          url,
          data,
          response: isFn ? status : { status, data: responseData },
          isNetworkError: false,
          replyOnce: false,
        });
        return self;
      },

      replyOnce(status, responseData) {
        const isFn = typeof status === 'function';
        self._addHandler(method, {
          url,
          data,
          response: isFn ? status : { status, data: responseData },
          isNetworkError: false,
          replyOnce: true,
        });
        return self;
      },

      networkError() {
        self._addHandler(method, {
          url,
          data,
          response: null,
          isNetworkError: true,
          replyOnce: false,
        });
        return self;
      },
    };
  }

  /**
   * Add a handler to the per-method list.  Persistent handlers (replyOnce =
   * false) replace any existing persistent handler with the same URL + body,
   * matching axios-mock-adapter v2 behaviour.  replyOnce handlers are always
   * appended so they can be stacked.
   */
  _addHandler(method, handler) {
    if (handler.replyOnce) {
      this.handlers[method].push(handler);
      return;
    }

    const index = this._findExistingPersistent(method, handler);
    if (index > -1) {
      this.handlers[method].splice(index, 1, handler);
    } else {
      this.handlers[method].push(handler);
    }
  }

  _findExistingPersistent(method, handler) {
    const handlers = this.handlers[method];
    for (let i = 0; i < handlers.length; i++) {
      const existing = handlers[i];
      if (existing.replyOnce) continue;

      const sameUrl =
        existing.url instanceof RegExp && handler.url instanceof RegExp
          ? String(existing.url) === String(handler.url)
          : existing.url === handler.url;

      if (sameUrl && deepEqual(existing.data, handler.data)) {
        return i;
      }
    }
    return -1;
  }

  onGet(url, data) {
    return this._createRequestApi('get', url, data);
  }
  onPost(url, data) {
    return this._createRequestApi('post', url, data);
  }
  onPut(url, data) {
    return this._createRequestApi('put', url, data);
  }
  onPatch(url, data) {
    return this._createRequestApi('patch', url, data);
  }
  onDelete(url, data) {
    return this._createRequestApi('delete', url, data);
  }
  onHead(url, data) {
    return this._createRequestApi('head', url, data);
  }
  onOptions(url, data) {
    return this._createRequestApi('options', url, data);
  }

  // -- Lifecycle --

  reset() {
    this.handlers = {};
    this.history = {};
    for (const method of METHODS) {
      this.handlers[method] = [];
      this.history[method] = [];
    }
  }

  restore() {
    this.client._transport = this._originalTransport;
  }

  // -- Request handling --

  _findHandler(method, url, body, baseURL) {
    const handlers = this.handlers[method];
    for (const handler of handlers) {
      // Skip incomplete handlers (onGet called but no reply yet)
      if (!handler.response && !handler.isNetworkError) continue;

      // URL matching — try both raw url and resolved url, matching
      // axios-mock-adapter's behaviour exactly.
      let matchesUrl = false;
      if (typeof handler.url === 'string') {
        matchesUrl =
          isUrlMatching(url, handler.url) ||
          isUrlMatching(combineUrls(baseURL, url), handler.url);
      } else if (handler.url instanceof RegExp) {
        matchesUrl =
          handler.url.test(url) || handler.url.test(combineUrls(baseURL, url));
      }

      if (!matchesUrl) continue;

      // Body matching — if the handler specifies a body, it must deep-equal
      // the request body. Undefined body matcher = match any body.
      //
      // We normalise via JSON round-trip to strip undefined values, matching
      // axios-mock-adapter which receives JSON-serialised data from axios'
      // transformRequest (undefined values are omitted by JSON.stringify).
      if (handler.data !== undefined) {
        let normalizedBody = body;
        if (body !== undefined && body !== null) {
          try {
            normalizedBody = JSON.parse(JSON.stringify(body));
          } catch (_e) {
            // keep raw body if not serialisable
          }
        }
        if (!deepEqual(normalizedBody, handler.data)) continue;
      }

      return handler;
    }
    return null;
  }

  async _handleRequest(config) {
    const method = config.method.toLowerCase();
    const url = config.url || '';

    // Record in history (per-method array)
    this.history[method].push({
      url: config.url,
      data: config.data !== undefined ? JSON.stringify(config.data) : undefined,
      headers: config.headers,
      params: config.params,
    });

    const handler = this._findHandler(method, url, config.data, config.baseURL);

    if (handler) {
      // Remove replyOnce handlers after they're consumed
      if (handler.replyOnce) {
        const index = this.handlers[method].indexOf(handler);
        if (index > -1) {
          this.handlers[method].splice(index, 1);
        }
      }

      if (handler.isNetworkError) {
        // Simulate fetch's network-level rejection
        throw new TypeError('Network Error');
      }

      let status, data;
      if (typeof handler.response === 'function') {
        // Function reply: call with config, result is [status, data] or { status, data }
        const result = await handler.response(config);
        status = result.status || result[0];
        data = result.data || result[1];
      } else {
        status = handler.response.status;
        data = handler.response.data;
      }

      return {
        status,
        statusText: '',
        headers: {},
        data: deepCopy(data),
      };
    }

    // No matching handler — return 404 (axios-mock-adapter default)
    return {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      data: undefined,
    };
  }
}

export default MockAdapter;
