// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import axios from 'axios';

export const capture = (apiHost, apiKey, event, userID, properties) =>
  axios.post(`${apiHost}/i/v0/e/`, {
    api_key: apiKey,
    event,
    distinct_id: userID,
    properties,
  });
