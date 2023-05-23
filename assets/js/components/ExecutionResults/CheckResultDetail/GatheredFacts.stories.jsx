import React from 'react';
import GatheredFacts from './GatheredFacts';

export default {
  title: 'GatheredFacts',
  component: GatheredFacts,
  args: {
    isTargetHost: true,
    gatheredFacts: [
      {
        name: 'Bail Prestor Organa',
        value: '1',
        type: 'best type',
        message: 'wow',
      },
      {
        name: 'Yoda',
        value: '2',
        type: 'second best type',
        message: 'second wow',
      },
    ],
  },
};

export function Default(args) {
  return <GatheredFacts {...args} />;
}
