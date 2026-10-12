// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import ChartsDisabledBox from '@common/ChartsDisabledBox';

function ChartsFeatureWrapper({ children, chartsEnabled }) {
  if (!chartsEnabled) return <ChartsDisabledBox />;
  return children;
}

export default ChartsFeatureWrapper;
