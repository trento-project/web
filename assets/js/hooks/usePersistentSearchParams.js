// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

import { readViewSetting, writeViewSetting } from '@lib/viewSettings';

const defaultOptions = {};
const noTransientKeys = [];
const noDefaultParams = {};

const isEmpty = (searchParams) => Array.from(searchParams.keys()).length === 0;

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

  const [searchParams, setSearchParams] = useSearchParams();

  // The view is restored only when it is entered, while it is stored every time
  // its params change. Both happen in the same effect, which therefore has to
  // tell the run entering the view from the ones following it
  const restored = useRef(false);

  useEffect(() => {
    const firstRun = !restored.current;

    restored.current = true;

    // Params found in the URL always win over the stored ones, so the view is
    // restored only when it is entered with a bare one. A view which was never
    // visited has nothing stored and falls back to its default params, while
    // one whose filters were all cleared has an empty string and keeps them
    const enteringEmptyView = firstRun && isEmpty(searchParams);
    const paramsToRestore =
      enteringEmptyView &&
      (readViewSetting(viewKey) ??
        new URLSearchParams(defaultParams).toString());

    if (paramsToRestore) {
      // Storing is left to the run these params trigger, so that the bare ones
      // this run was rendered with never reach the storage
      setSearchParams(paramsToRestore, { replace: true });
      return;
    }

    writeViewSetting(
      viewKey,
      withoutTransientKeys(searchParams, transientKeys)
    );
  }, [searchParams]);

  return [searchParams, setSearchParams];
};

export default usePersistentSearchParams;
