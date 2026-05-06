// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

const defaultGreeting = (
  <>
    <div className="font-bold text-gray-600">Hi, I&apos;m Liz.</div>
    <div>How can I help you today?</div>
  </>
);

export function ThreadWelcome({ greeting = defaultGreeting, children }) {
  return (
    <div className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-6 pt-32 pb-2">
      <div className="text-[22px] leading-snug text-gray-500">{greeting}</div>
      {children && <div className="flex flex-col gap-3">{children}</div>}
    </div>
  );
}
