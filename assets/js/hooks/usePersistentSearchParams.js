// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router';

import { readViewSetting, writeViewSetting } from '@lib/viewSettings';

const defaultOptions = {};
const noTransientKeys = [];
const noDefaultParams = {};

const isEmpty = (searchParams) => Array.from(searchParams.keys()).length === 0;

const OWN_NAVIGATION_STATE_KEY = 'persistentSearchParams';

const isOwnNavigation = ({ state }) =>
  state?.[OWN_NAVIGATION_STATE_KEY] === true;

const markAsOwnNavigation = (navigateOptions = {}) => ({
  ...navigateOptions,
  state: { ...navigateOptions.state, [OWN_NAVIGATION_STATE_KEY]: true },
});

const withoutTransientKeys = (searchParams, transientKeys) => {
  const persistable = new URLSearchParams(searchParams);

  transientKeys.forEach((key) => persistable.delete(key));

  return persistable.toString();
};

/**
 * Drop in replacement for react router's `useSearchParams` which remembers the
 * search params of a view for the duration of the browser session, so that the
 * user lands back on the same filters and page size however they return to it.
 *
 * Search params found in the URL always win over the stored ones, which is what
 * makes a filtered URL shareable between users.
 *
 * @param {String} viewKey - Identifies the view the settings belong to
 * @param {Array} options.transientKeys - Params which are kept in the URL but never stored,
 * such as pagination cursors or free text searches
 * @param {Object} options.defaultParams - Params applied when the URL is bare and the view
 * has no stored settings yet. Use the entries form, `[['key', 'a'], ['key', 'b']]`, for
 * params which are repeated
 */
const usePersistentSearchParams = (viewKey, options = defaultOptions) => {
  const { transientKeys = noTransientKeys, defaultParams = noDefaultParams } =
    options;

  const [urlParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // The restored params are handed to the view during the very render the entry
  // happens in, before the URL catches up with them
  const entry = useRef({ locationKey: null, restoredParams: null });

  if (entry.current.locationKey !== location.key) {
    // Entering a view is a navigation, not a mount: react router keeps the view
    // mounted when the user navigates to it from, say, the sidebar entry of the
    // view they are already in. The locations this hook itself navigated to are
    // therefore the only ones it can tell apart from the ones an entry brings in.
    // They are told apart by the location itself, since a user navigation can be
    // rendered in place of a pending one of the hook
    const firstRun = entry.current.locationKey === null;
    const enteringView = firstRun || !isOwnNavigation(location);

    // Params found in the URL always win over the stored ones, so the view is
    // restored only when it is entered with a bare one. A view which was never
    // visited has nothing stored and falls back to its default params, while
    // one whose filters were all cleared has an empty string and keeps them
    const paramsToRestore =
      enteringView &&
      isEmpty(urlParams) &&
      (readViewSetting(viewKey) ??
        new URLSearchParams(defaultParams).toString());

    // DEBUG(activity-log-load-twice)
    window.__pspDebug = window.__pspDebug || [];
    window.__pspDebug.push({
      t: Math.round(performance.now()),
      viewKey,
      key: location.key,
      search: location.search,
      firstRun,
      ownNavigationWas: !enteringView && !firstRun,
      enteringView,
      urlEmpty: isEmpty(urlParams),
      restore: paramsToRestore || null,
    });

    entry.current = {
      locationKey: location.key,
      // The params are kept as they are for as long as the location lasts, so
      // that the view is not handed a new instance on every render
      restoredParams: paramsToRestore
        ? new URLSearchParams(paramsToRestore)
        : null,
    };
  }

  const { restoredParams } = entry.current;
  const searchParams = restoredParams ?? urlParams;

  const setPersistentSearchParams = useCallback(
    (nextInit, navigateOptions) => {
      // DEBUG(activity-log-load-twice)
      window.__pspDebug = window.__pspDebug || [];
      window.__pspDebug.push({
        t: Math.round(performance.now()),
        viewKey,
        setter: String(nextInit),
        replace: !!navigateOptions?.replace,
      });

      setSearchParams(
        typeof nextInit === 'function'
          ? nextInit(new URLSearchParams(searchParams))
          : nextInit,
        markAsOwnNavigation(navigateOptions)
      );
    },
    [setSearchParams, searchParams]
  );

  useEffect(() => {
    if (restoredParams) {
      setPersistentSearchParams(restoredParams, { replace: true });
      return;
    }

    // DEBUG(activity-log-load-twice)
    window.__pspDebug = window.__pspDebug || [];
    window.__pspDebug.push({
      t: Math.round(performance.now()),
      viewKey,
      write: withoutTransientKeys(urlParams, transientKeys),
      key: location.key,
    });
    writeViewSetting(viewKey, withoutTransientKeys(urlParams, transientKeys));
  }, [location]);

  return [searchParams, setPersistentSearchParams];
};

export default usePersistentSearchParams;
