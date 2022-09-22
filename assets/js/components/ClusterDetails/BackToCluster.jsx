import React from 'react';
import Button from '@components/Button';
import { useNavigate } from 'react-router-dom';
import { EOS_ARROW_BACK } from 'eos-icons-react';

export const BackToCluster = ({ clusterId }) => {
  const navigate = useNavigate();
  return (
    <div className="flex mb-8">
      <div className="flex w-2/5">
        <Button
          className="w-2/3 text-jungle-green-500 text-left py-0 px-0"
          size="small"
          type="transparent"
          onClick={() => navigate(`/clusters/${clusterId}`)}
        >
          <EOS_ARROW_BACK className="inline-block fill-jungle-green-500" /> Back
          to Cluster Details
        </Button>
      </div>
    </div>
  );
};
