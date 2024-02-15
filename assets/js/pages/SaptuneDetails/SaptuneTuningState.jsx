import React from 'react';

import HealthIcon from '@common/HealthIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Tooltip from '@common/Tooltip';

function SaptuneTuningState({ state }) {
  const TooltipContent = () => (
    <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
      Run `saptune note verify` in the host for further details
    </ReactMarkdown>
  );
  switch (state) {
    case 'compliant':
      return <span>Compliant</span>;
    case 'not compliant':
      return (
        <div className="flex">
          <Tooltip content={<TooltipContent />}>
            <HealthIcon health="critical" />
          </Tooltip>
          <span className="ml-1">Not compliant</span>
        </div>
      );
    case 'not tuned':
      return (
        <div className="flex">
          <HealthIcon health="warning" />
          <span className="ml-1">No tuning</span>
        </div>
      );
    default:
      return <span>-</span>;
  }
}

export default SaptuneTuningState;
