import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { ExecutionIcon } from './ExecutionIcon';

const CheckResult = ({
  checkId,
  description,
  executionState,
  health,
  onClick,
}) => (
  <tr
    className="animate-fade tn-check-result-row cursor-pointer hover:bg-emerald-50 ease-in-out duration-300"
    onClick={onClick}
  >
    <td className="px-6 py-4 whitespace-nowrap text-jungle-green-500">
      {checkId}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
        {description}
      </ReactMarkdown>
    </td>
    <td className="px-6 py-4 whitespace-nowrap content-center">
      <ExecutionIcon executionState={executionState} health={health} />
    </td>
  </tr>
);

export default CheckResult;
