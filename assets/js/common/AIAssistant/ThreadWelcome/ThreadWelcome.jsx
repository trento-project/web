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
 *   <ThreadPrimitive.Suggestion prompt="How do I add agents via the API?">
 *        How do I add agents via the API?
 *   </ThreadPrimitive.Suggestion>
 *   <ThreadPrimitive.Suggestion prompt="What are the most recent check results?">
 *        What are the most recent check results?
 *   </ThreadPrimitive.Suggestion>
 * </ThreadWelcome>
 *
 * @param {Object} props
 * @param {React.ReactNode} props.greeting - Custom greeting component.
 * @param {React.ReactNode} props.children - Additional content to render below the greeting.
 * @returns {JSX.Element}
 */
function ThreadWelcome({ greeting = defaultGreeting, children }) {
  return (
    <div className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-6 pt-32 pb-2">
      <div className="text-[22px] leading-snug text-gray-500">{greeting}</div>
      {children && <div className="flex flex-col gap-3">{children}</div>}
    </div>
  );
}

export default ThreadWelcome;
