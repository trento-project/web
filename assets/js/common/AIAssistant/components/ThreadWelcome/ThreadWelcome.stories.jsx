import React from 'react';
import { ThreadWelcome } from './ThreadWelcome';

const suggestionClassName =
  'text-left bg-[#f8f9fa] border border-gray-200 rounded-lg p-3.5 text-gray-500 hover:bg-gray-100 transition-colors text-[15px]';

export default {
  title: 'Components/AIAssistant/ThreadWelcome',
  component: ThreadWelcome,
  argTypes: {
    greeting: {
      description: 'Greeting node rendered above the suggestions',
      control: false,
    },
    children: {
      description: 'Clickable suggestion elements rendered under the greeting',
      control: false,
    },
  },
};

export const Default = {
  render: () => (
    <ThreadWelcome>
      <button type="button" className={suggestionClassName}>
        <span className="font-bold text-gray-600">What is the API key</span> for adding agents?
      </button>
      <button type="button" className={suggestionClassName}>
        <span className="font-bold text-gray-600">What is the check results</span> that was run recently?
      </button>
    </ThreadWelcome>
  ),
};

export const NoSuggestions = {
  render: () => <ThreadWelcome />,
};

export const CustomGreeting = {
  render: () => (
    <ThreadWelcome
      greeting={
        <>
          <div className="font-bold text-gray-600">Welcome back.</div>
          <div>Pick up where you left off.</div>
        </>
      }
    />
  ),
};
