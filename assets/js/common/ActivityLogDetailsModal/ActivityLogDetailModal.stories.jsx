// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { toRenderedEntry } from '@common/ActivityLogOverview/ActivityLogOverview';
import { RESOURCE_TAGGING } from '@lib/model/activityLog';
import {
  activityLogEntryFactory,
  taggingMetadataFactory,
} from '@lib/test-utils/factories/activityLog';
import { action } from 'storybook/actions';

import ActivityLogDetailModal from './ActivityLogDetailModal';

export default {
  title: 'Components/ActivityLogDetailModal',
  component: ActivityLogDetailModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: { type: 'boolean' },
    },
    entry: {
      description: 'An Activity Log entry.',
      control: { type: 'object' },
    },
    onClose: {
      description: 'Callback when the Cancel button is clicked',
      action: 'onClose',
    },
  },
};

export const Default = {
  args: {
    open: false,
    entry: toRenderedEntry(activityLogEntryFactory.build()),
    onClose: action('onClose'),
  },
};

export const UnknownActivityType = {
  args: {
    ...Default.args,
    entry: toRenderedEntry(activityLogEntryFactory.build({ type: 'foo_bar' })),
  },
};

export const UnknownResourceType = {
  args: {
    ...Default.args,
    entry: toRenderedEntry(
      activityLogEntryFactory.build({
        type: RESOURCE_TAGGING,
        metadata: taggingMetadataFactory.build({ resource_type: 'foo_bar' }),
      })
    ),
  },
};
