// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

const defaultGreeting = (
  <>
    <div className="font-bold text-gray-600">Hi, I&apos;m Liz.</div>
    <div>How can I help you today?</div>
  </>
);

/**
 * Initial greeting for the AI Assistant thread. The `greeting` prop can be used to override the default greeting.
 * The `children` prop is used to render additional content below the greeting, such as prompt suggestions.
 *
 * @example
 * <ThreadWelcome>
 *   <ThreadPrimitive.Suggestion prompt="What is the API key for adding agents?">
 *        What is the API key for adding agents?
 *   </ThreadPrimitive.Suggestion>
 *   <ThreadPrimitive.Suggestion prompt="What is the check results that was run recently?">
 *        What is the check results that was run recently?
 *   </ThreadPrimitive.Suggestion>
 * </ThreadWelcome>
 *
 * @param {Object} props
 * @param {React.ReactNode} props.greeting - Custom greeting component.
 * @param {React.ReactNode} props.children - Additional content to render below the greeting.
 * @returns {JSX.Element}
 */
// `children` renders below the greeting and is the slot for prompt
// suggestions (e.g. `<ThreadPrimitive.Suggestion>` from `@assistant-ui/react`).
function ThreadWelcome({ greeting = defaultGreeting, children }) {
  return (
    <div className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-6 pt-32 pb-2">
      <div className="text-[22px] leading-snug text-gray-500">{greeting}</div>
      {children && <div className="flex flex-col gap-3">{children}</div>}
    </div>
  );
}

export default ThreadWelcome;
