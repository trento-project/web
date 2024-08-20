import React from 'react';

import Button from '@common/Button';

export default function LoginSSO({ singleSignOnUrl, error }) {
  return (
    <>
      {error && (
        <span className="block text-sm font-medium mb-5">
          An error occurred while trying to Login. Please retry login again.
          Should the error persist, contact the administrator.
        </span>
      )}
      <Button
        onClick={() => {
          window.location.href = singleSignOnUrl;
        }}
      >
        Login with Single Sign-on
      </Button>
    </>
  );
}
