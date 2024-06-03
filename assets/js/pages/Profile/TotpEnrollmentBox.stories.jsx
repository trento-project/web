import { faker } from '@faker-js/faker';
import TotpEnrollmentBox from './TotpEnrollmentBox';

export default {
  title: 'Components/TotpEnrollmentBox',
  component: TotpEnrollmentBox,
  argTypes: {
    secret: {
      description: 'TOTP secret',
      control: {
        type: 'text',
      },
    },
    qrData: {
      description: 'TOTP enrollment payload as qr code',
      control: {
        type: 'text',
      },
    },
    errors: {
      description: 'Totp errors during the enrollment verify procedure',
      control: {
        type: 'boolean',
      },
    },
    loading: {
      control: {
        type: 'boolean',
      },
    },
    verifyTotp: {
      action: 'Verify enrollment TOTP',
    },
  },
};

export const Default = {
  args: {
    secret: faker.string.uuid(),
    qrData:
      'otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example',
  },
};

export const WithErrors = {
  args: {
    ...Default.args,
    errors: [
      {
        detail: 'Error validating totp code',
        source: { pointer: '/totp_code' },
        title: 'Invalid value',
      },
    ],
  },
};
