import React from 'react';
import { EOS_LOCK_OUTLINED } from 'eos-icons-react';
import { formatDateOnly } from '@lib/timezones';

function CertificateUploadDate({ date, timezone }) {
  if (!date) {
    return '-';
  }

  return (
    <div className="flex flex-row items-center">
      <EOS_LOCK_OUTLINED className="mr-3" size="25" />

      <div>
        <div>Certificate Uploaded</div>
        <div className="text-xs">
          Uploaded: {formatDateOnly(date, timezone)}
        </div>
      </div>
    </div>
  );
}

export default CertificateUploadDate;
