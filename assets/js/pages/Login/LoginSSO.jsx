import React from 'react';

import Button from '@common/Button';

export default function LoginSSO({ singleSignOnUrl }) {
  return (
    <Button
      onClick={() => {
        window.location.href = singleSignOnUrl;
      }}
    >
      Login with Single Sign-on
    </Button>
  );
}
