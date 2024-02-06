import React from 'react';
import { format } from 'date-fns';
import { EOS_LOCK_OUTLINED } from 'eos-icons-react';

function CertificateUploadDate({ date }) {
  if (!date) {
    return '-';
  }

  return (
    <div className="flex flex-row items-center">
      <EOS_LOCK_OUTLINED className="mr-3" size="25" />

      <div>
        <div>Certificate Uploaded</div>
        <div className="text-xs">{format(date, "'Uploaded:' dd MMM y")}</div>
      </div>
    </div>
  );
}

export default CertificateUploadDate;
