import React from 'react';

import NotFound from '.';

export default {
  title: 'NotFound',
  component: NotFound,
  args: { buttonText: 'Go back home', onNavigate: () => {} },
};

export function Default(args) {
  return <NotFound {...args} />;
}
