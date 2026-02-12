import { HttpAgent } from '@ag-ui/client';
import { getAssistantContext } from './useAssistantContext';

// Module-level context provider (can be overridden by the app)
let contextProvider = getAssistantContext;

export function setGlobalContextProvider(fn) {
  if (typeof fn === 'function') contextProvider = fn;
}

/**
 * CustomHttpAgent extends HttpAgent to optionally accept a contextProvider.
 * Note: the AG-UI client uses the global `fetch` under the hood, so we
 * provide a module-level hook (`setGlobalContextProvider`) that Assistant
 * code can call from the provider layer to supply context reliably.
 */
export class CustomHttpAgent extends HttpAgent {
  constructor(config, instanceContextProvider = null) {
    super(config);
    // keep an instance provider for future use (not required by global fetch)
    this.contextProvider = instanceContextProvider || contextProvider;
  }
}

// Global fetch wrapper that injects AG-UI protocol `context` when
// sending requests to the assistant endpoint. We build a small,
// sanitized array of {description, value} entries (per AG-UI spec)
// and append it to request.body.context. This replaces previous
// forwardedProps usage — backends should read `context` instead.
const originalWindowFetch = window.fetch.bind(window);

const MAX_STRING = 200;
const MAX_ARRAY = 10;

const sanitizeValue = (v) => {
  if (v == null) return v;
  if (typeof v === 'string') return v.length > MAX_STRING ? v.slice(0, MAX_STRING) + '…' : v;
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v.slice(0, MAX_ARRAY).map(sanitizeValue);
  if (typeof v === 'object') {
    // keep only primitive fields and small arrays
    const out = {};
    Object.keys(v).slice(0, 20).forEach((k) => {
      const val = v[k];
      if (val == null) return;
      if (typeof val === 'object' && !Array.isArray(val)) return; // skip deep objects
      out[k] = sanitizeValue(val);
    });
    return out;
  }
  return undefined;
};

// Default (agnostic) serializer: a single entry named `current page`
// containing only the sanitized `data` payload. Domain-specific
// flattening (hosts, ids, clusters, etc.) must live in a pluggable
// serializer provided by the integration layer.
const defaultContextSerializer = (c) => {
  if (!c) return [];
  return [
    {
      description: c.page || 'current page',
      value: sanitizeValue(c.data || c.value || {}),
    },
  ];
};

// Module-scoped serializer (overridable by integrations)
let contextSerializer = defaultContextSerializer;
export function setContextSerializer(fn) {
  if (typeof fn === 'function') contextSerializer = fn;
}

// Exported so tests can restore the original fetch; replaced at runtime
// when a real browser environment is available.
export let restoreGlobalFetch = () => {};

const buildAgUiContext = (ctx) => {
  try {
    return (contextSerializer(ctx) || []).slice(0, MAX_ARRAY);
  } catch (err) {
    console.debug('[CustomHttpAgent] contextSerializer error:', err);
    return [];
  }
};

// Install a hardened, idempotent wrapper around the global fetch.
// - safer agent detection (URL | Request | JSON body when content-type is JSON)
// - safe JSON parsing
// - does not break non-agent requests
// - preserves original fetch and exposes `restoreGlobalFetch` for tests
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  if (!window.__CUSTOM_HTTP_AGENT_INSTALL__) {
    const _originalWindowFetch = window.fetch.bind(window);
    window.__CUSTOM_HTTP_AGENT_INSTALL__ = true;
    window.__ORIGINAL_FETCH__ = _originalWindowFetch;

    const safeParseJson = (s) => {
      try {
        return JSON.parse(s);
      } catch (_) {
        return null;
      }
    };

    const headerHasJson = (hdrs) => {
      if (!hdrs) return false;
      const get = (k) => (typeof hdrs.get === 'function' ? hdrs.get(k) : hdrs[k]);
      const ct = get('content-type') || get('Content-Type');
      return typeof ct === 'string' && ct.toLowerCase().includes('application/json');
    };

    // rebind restoreGlobalFetch to actually restore
    restoreGlobalFetch = () => {
      if (window.__ORIGINAL_FETCH__) {
        window.fetch = window.__ORIGINAL_FETCH__;
        delete window.__CUSTOM_HTTP_AGENT_INSTALL__;
        delete window.__ORIGINAL_FETCH__;
      }
    };

    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input?.url || '';

      try {
        const ctx = (typeof contextProvider === 'function' && contextProvider()) || null;

        const looksLikeAgentUrl = typeof url === 'string' && url.includes('/api/agent');
        const contentIsJson = headerHasJson(init?.headers) || headerHasJson(input?.headers);
        const parsedBody = contentIsJson && typeof init?.body === 'string' ? safeParseJson(init.body) : null;
        const hasQuery = parsedBody && typeof parsedBody.query !== 'undefined';
        const isAgentCall = looksLikeAgentUrl || hasQuery;

        if (ctx && isAgentCall && parsedBody) {
          const agContext = buildAgUiContext(ctx);
          if (agContext.length) {
            const newBody = {
              ...parsedBody,
              context: Array.isArray(parsedBody.context) ? parsedBody.context.concat(agContext) : agContext,
            };
            init = { ...(init || {}), body: JSON.stringify(newBody) };
            init.headers = init.headers || {};
            if (typeof init.headers.set === 'function') {
              init.headers.set('content-type', 'application/json');
            } else {
              init.headers['content-type'] = 'application/json';
            }
            console.debug('[CustomHttpAgent] injected AG-UI context:', agContext);
          }
        }
      } catch (err) {
        // never break the network pipeline for integration errors
        console.debug('[CustomHttpAgent] could not inject AG-UI context:', err);
      }

      try {
        return await _originalWindowFetch(input, init);
      } catch (err) {
        // preserve original error but add context for debugging
        console.debug('[CustomHttpAgent] fetch failed for', typeof input === 'string' ? input : input?.url, err);
        throw err;
      }
    };
  }
} else {
  // non-browser/no-op: ensure restoreGlobalFetch exists (exported above)
  restoreGlobalFetch = () => {};
}
