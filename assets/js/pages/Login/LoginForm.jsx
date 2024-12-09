import React, { useState } from 'react';

import classNames from 'classnames';

import Input, { Password } from '@common/Input';

export default function LoginForm({
  authError,
  authInProgress,
  handleLoginSubmit,
  isUnauthorized,
  password,
  setPassword,
  setTotpCode,
  setUsername,
  totpCodeRequested,
  totpCode,
  username,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-6" onSubmit={handleLoginSubmit}>
      {!totpCodeRequested ? (
        <>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <div className="mt-1">
              <Input
                id="username"
                type="text"
                data-testid="login-username"
                disabled={authInProgress}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                name="username"
                autoComplete="username"
                required
                error={isUnauthorized}
                className={classNames(
                  'appearance-none text-inherit border-gray-300 shadow-sm sm:text-sm',
                  { 'disabled:opacity-50': authInProgress }
                )}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
            <Password
              id="password"
              initialValue={password}
              data-testid="login-password"
              disabled={authInProgress}

              name="password"
              placeholder={null}
              error={isUnauthorized}
              onChange={(e) => setPassword(e.target.value)}
              className={classNames(
                'appearance-none text-inherit sm:text-sm',
                { 'disabled:opacity-50': authInProgress }
              )}
            />
            </div>
          </div>
        </>
      ) : (
        <div>
          <label
            htmlFor="otp-code"
            className="block text-sm font-medium text-gray-700"
          >
            TOTP code
          </label>
          <div className="mt-1">
            <Input
              id="totp-code"
              type="text"
              data-testid="login-totp-code"
              disabled={authInProgress}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              autoComplete="off"
              required
              error={isUnauthorized}
              className={classNames(
                'appearance-none px-3 py-2 text-inherit border-gray-300 shadow-sm focus:ring-jungle-green-500 focus:border-jungle-green-500 sm:text-sm',
                { 'disabled:opacity-50': authInProgress }
              )}
            />
          </div>
        </div>
      )}
      {authError && authError.code === 401 && (
        <p className="text-sm text-center text-red-500">Invalid credentials</p>
      )}
      <div>
        <button
          type="submit"
          disabled={authInProgress}
          data-testid="login-submit"
          className={classNames(
            'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-jungle-green-500 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jungle-green-500',
            { 'disabled:opacity-50': authInProgress }
          )}
        >
          Login
        </button>
      </div>
    </form>
  );
}
