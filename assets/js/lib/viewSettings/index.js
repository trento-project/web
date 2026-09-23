// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

/**
 * Per view UI settings (filters, items per page) persisted for the duration of
 * the browser session.
 *
 * Settings are stored as serialized query strings, keyed by an arbitrary view
 * key, inside a single sessionStorage entry. sessionStorage keeps them alive
 * across page reloads while dropping them when the tab is closed.
 *
 * The entry also carries the ID of the user the settings belong to, but only
 * `initViewSettings` deals with it: sessionStorage outlives a login, so the
 * settings are wiped whenever a different user logs in in the same tab. Readers
 * and writers are deliberately unaware of the user, which keeps the whole
 * feature out of the authentication concerns.
 */

const STORAGE_VIEW_SETTINGS_IDENTIFIER = 'trento_view_settings';

// sessionStorage access throws in some privacy modes. Persisting settings is a
// convenience, so failures degrade to "nothing is remembered" instead of
// breaking the view.
const readBlob = () => {
  try {
    const stored = window.sessionStorage.getItem(
      STORAGE_VIEW_SETTINGS_IDENTIFIER
    );
    const { userID, settings } = stored ? JSON.parse(stored) : {};

    return { userID, settings: settings || {} };
  } catch (_error) {
    return { userID: undefined, settings: {} };
  }
};

const writeBlob = (blob) => {
  try {
    window.sessionStorage.setItem(
      STORAGE_VIEW_SETTINGS_IDENTIFIER,
      JSON.stringify(blob)
    );
  } catch (_error) {
    // ignored, see readBlob
  }
};

export const clearViewSettings = () => {
  try {
    window.sessionStorage.removeItem(STORAGE_VIEW_SETTINGS_IDENTIFIER);
  } catch (_error) {
    // ignored, see readBlob
  }
};

/**
 * Bind the stored settings to a user, discarding the ones left behind by
 * whoever was logged in before them in the same tab.
 *
 * Must be called on login, before any view is rendered.
 */
export const initViewSettings = (userID) => {
  const { userID: storedUserID } = readBlob();

  if (storedUserID === userID) return;

  clearViewSettings();
  writeBlob({ userID, settings: {} });
};

/**
 * Read the settings stored for a view.
 *
 * @returns {string|null} the stored query string, or null when the view was
 * never visited. An empty string is a meaningful value: the user visited the
 * view and cleared every filter.
 */
export const readViewSetting = (viewKey) => {
  const { settings } = readBlob();

  const setting = settings[viewKey];

  return typeof setting === 'string' ? setting : null;
};

/**
 * Store the settings of a view as a serialized query string.
 */
export const writeViewSetting = (viewKey, params) => {
  const { userID, settings } = readBlob();

  writeBlob({ userID, settings: { ...settings, [viewKey]: params } });
};
