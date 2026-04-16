import React from 'react';
import { format as formatDate } from 'date-fns';
import { tz } from '@date-fns/tz';
import { EOS_LOCK_OUTLINED } from 'eos-icons-react';
import { DATE_DAY_MONTH_YEAR_PADDED_FORMAT } from '@lib/timezones';

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
          Uploaded:{' '}
          {formatDate(date, DATE_DAY_MONTH_YEAR_PADDED_FORMAT, {
            in: tz(timezone),
          })}
        </div>
      </div>
    </div>
  );
}

export default CertificateUploadDate;
