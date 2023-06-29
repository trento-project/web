import React from 'react';

import PremiumPill from '@components/PremiumPill';
import Accordion from '.';

export default {
  title: 'Accordion',
  component: Accordion,
  argTypes: {
    header: {
      type: 'string',
      description:
        'The content of the accordion header. It can be a plain string or a Component',
      control: {
        type: 'text',
      },
    },
    children: {
      description:
        'The content of the accordion panel. It should be a Component',
      control: {
        type: 'text',
      },
    },
    withHandle: {
      description:
        'Whether the accordion header should have a chevron icon handle or not',
      control: {
        type: 'boolean',
      },
    },
    withTransition: {
      description:
        'Whether the accordion panel should open/close with a transition animation',
      control: {
        type: 'boolean',
      },
    },
    defaultOpen: {
      description: 'Whether the accordion should render open by default',
      control: {
        type: 'boolean',
      },
    },
    rounded: {
      description: 'Whether the accordion container should be rounded or not',
      control: {
        type: 'boolean',
      },
    },
  },
};

export const Default = {
  args: {
    header: 'Accordion Header',
    children: <div className="p-6">Accordion content</div>,
  },
};

export const WithoutHandle = {
  args: {
    ...Default.args,
    withHandle: false,
  },
};

export const WithCustomHeader = {
  args: {
    ...WithoutHandle.args,
    header: (
      <div className="check-row px-4 py-4 sm:px-6">
        <div className="flex items-center">
          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            AAAA
          </p>
          <PremiumPill className="ml-1" />
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">Accordion with custom header</div>
        </div>
      </div>
    ),
  },
};

export const WithTransition = {
  args: {
    ...Default.args,
    withTransition: true,
  },
};
