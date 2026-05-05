// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import ChartsDisabledBox from '@common/ChartsDisabledBox';

function ChartsFeatureWrapper({ children, chartsEnabled }) {
  if (!chartsEnabled) return <ChartsDisabledBox />;
  return children;
}

export default ChartsFeatureWrapper;
