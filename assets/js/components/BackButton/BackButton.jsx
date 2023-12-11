import React from 'react';
import Button from '@common/Button';
import { useNavigate } from 'react-router-dom';
import { EOS_ARROW_BACK } from 'eos-icons-react';

export function BackButton({ children, url }) {
  const navigate = useNavigate();

  return (
    <div className="flex mb-4">
      <div className="flex w-2/5">
        <Button
          className="w-2/3 text-jungle-green-500 text-left py-0 px-0"
          size="small"
          type="transparent"
          onClick={() => navigate(url)}
        >
          <EOS_ARROW_BACK className="inline-block fill-jungle-green-500" />
          {children}
        </Button>
      </div>
    </div>
  );
}

export default BackButton;
