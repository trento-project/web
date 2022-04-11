import React from 'react';
import { EOS_FLAG_OUTLINED } from 'eos-icons-react';

const FeedbackCollector = () => {
  return (
    <button
      id="feedback-button"
      className="flex feedback-tool-button py-2 px-4"
    >
      <span className="mt-1">
        <EOS_FLAG_OUTLINED size={20} color={'#fff'}></EOS_FLAG_OUTLINED>
      </span>
      <span className="ml-2">Report feedback</span>
    </button>
  );
};

export default FeedbackCollector;
