import CheckResultDetail from '.';
import { providers } from '@lib/model';

export default {
  title: 'Components/CheckResultInfoBox',
  component: CheckResultDetail,
  argTypes: {
    checkID: {
      description: 'Identifier for the checkID',
      control: { type: 'text' },
    },
    resultTargetType: {
      description: 'The resultTargetType prop',
      control: { type: 'text' },
    },
    resultTargetName: {
      description: 'The resultTargetName prop',
      control: { type: 'text' },
    },
    provider: {
      description: 'Cloud provider',
      control: { type: 'select' },
      options: [...providers, 'unrecognized-provider'],
    },
  },
};

export const Default = {
  args: {
    checkID: 'check-123',
    resultTargetType: 'cluster',
    resultTargetName: 'Cluster 1',
    provider: 'aws',
  },
};
