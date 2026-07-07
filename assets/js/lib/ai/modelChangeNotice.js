// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

// Marker prefixing the "known shape" model-change notice payload. Kept in sync
// with the backend (TrentoWeb.AIAssistant.AgUi @model_change_marker).
export const MODEL_CHANGE_MARKER = '::trento:model-change::';

// Detects the `:known_shape` model-change notice. Since assistant-ui keeps each
// message id as an isolated text part, the notice arrives as its own part whose
// text is exactly this payload — so a custom part renderer can swap it out.
// Returns `{ provider, model }` or `null` for ordinary text.
export const parseModelChangeShape = (text) => {
  if (typeof text !== 'string' || !text.startsWith(MODEL_CHANGE_MARKER)) {
    return null;
  }

  try {
    const { provider, model } = JSON.parse(
      text.slice(MODEL_CHANGE_MARKER.length)
    );
    return provider && model ? { provider, model } : null;
  } catch {
    return null;
  }
};
