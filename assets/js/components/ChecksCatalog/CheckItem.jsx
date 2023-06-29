import React from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import PremiumPill from '@components/PremiumPill';
import Accordion from '@components/Accordion';

function CheckItem({ checkID, premium = false, description, remediation }) {
  return (
    <li>
      <Accordion
        withHandle={false}
        withTransition
        rounded={false}
        headerClassnames="hover:bg-gray-100"
        header={
          <div className="check-row px-4 py-4 sm:px-6">
            <div className="flex items-center">
              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {checkID}
              </p>
              {premium && <PremiumPill className="ml-1" />}
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <ReactMarkdown
                  className="markdown text-sm"
                  remarkPlugins={[remarkGfm]}
                >
                  {description}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        }
      >
        <div className="check-panel px-8 py-4 sm:px-8 border-none">
          <div className="px-4 py-4 sm:px-4 bg-slate-100 rounded">
            <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
              {remediation}
            </ReactMarkdown>
          </div>
        </div>
      </Accordion>
    </li>
  );
}

export default CheckItem;
