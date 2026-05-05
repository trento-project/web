import CertificateUploadDate from './CertificateUploadDate';

export default {
  title: 'Components/SuseManagerConfig/CertificateUploadDate',
  component: CertificateUploadDate,
  argTypes: {
    date: {
      description: 'Upload date (ISO string or null)',
      control: { type: 'date' },
    },
    timezone: {
      type: 'string',
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
      defaultValue: 'Etc/UTC',
    },
  },
};

export const Default = {
  args: {
    date: new Date().toISOString(),
    timezone: 'Etc/UTC',
  },
};

export const NoDate = {
  args: {
    ...Default.args,
    date: null,
    timezone: 'Etc/UTC',
  },
};
