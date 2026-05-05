// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import NotFound from '.';

export default {
  title: 'Layouts/NotFound',
  component: NotFound,
  args: { buttonText: 'Go back home', onNavigate: () => {} },
};

export function Default(args) {
  return <NotFound {...args} />;
}
