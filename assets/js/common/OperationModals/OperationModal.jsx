// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useEffect, useState } from 'react';
import { noop } from 'lodash';

import Modal from '@common/Modal';
import Button from '@common/Button';
import Label from '@common/Label';
import Input from '@common/Input';
import Banner from '@common/Banners';
import {
  shouldShowOperationDisclaimer,
  waiveOperationDisclaimer,
} from '@lib/operations';

import ScheduleFields, {
  initialScheduleForm,
  isScheduleFormValid,
  scheduleToForm,
  toScheduleRequest,
} from './ScheduleFields';

function DisclaimerContent({
  dontShowAgainDisclaimerChecked,
  setDontShowAgainDisclaimerChecked,
  operationText,
}) {
  return (
    <>
      <Banner type="warning" iconSize="xl" truncate={false}>
        By proceeding I confirm to be aware of the impact that executing
        operation &quot;{operationText}&quot; will have in my environment
      </Banner>
      <div className="flex space-x-1 items-center pt-2">
        <Label className="cursor-pointer">
          Don&apos;t show this again
          <Input
            className="inline-block cursor-pointer ml-1 centered"
            type="checkbox"
            checked={dontShowAgainDisclaimerChecked}
            onChange={() => setDontShowAgainDisclaimerChecked((prev) => !prev)}
          />
        </Label>
      </div>
    </>
  );
}

function OperationModal({
  title,
  description,
  operationText,
  requestDisabled = false,
  isOpen = false,
  schedulable = false,
  timezone = 'Etc/UTC',
  initialSchedule = null,
  onRequest = noop,
  onCancel = noop,
  onCancelSchedule = null,
  children,
}) {
  const startForm = () =>
    initialSchedule
      ? scheduleToForm(initialSchedule, timezone)
      : initialScheduleForm(timezone);

  const [scheduleForm, setScheduleForm] = useState(startForm);
  const scheduling = schedulable && scheduleForm.type !== 'now';

  const [showDisclaimer, setShowDisclaimer] = useState(
    shouldShowOperationDisclaimer()
  );
  const [dontShowAgainDisclaimerChecked, setDontShowAgainDisclaimerChecked] =
    useState(false);

  const resolvedTitle = showDisclaimer ? 'Disclaimer' : title;

  const maybeWaiveDisclaimerAndContinue = () => {
    dontShowAgainDisclaimerChecked && waiveOperationDisclaimer();
    setShowDisclaimer(false);
    setDontShowAgainDisclaimerChecked(false);
  };

  // onRequest receives the schedule, or null when the operation is requested now
  const resolvedOnProceedClick = showDisclaimer
    ? maybeWaiveDisclaimerAndContinue
    : () =>
        onRequest(
          schedulable ? toScheduleRequest(scheduleForm, timezone) : null
        );

  useEffect(() => {
    isOpen && setShowDisclaimer(shouldShowOperationDisclaimer());
    isOpen && setScheduleForm(startForm());
    // Reset only when the modal opens, not when the schedule list refreshes
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [isOpen]);

  let requestLabel = 'Request';
  if (scheduling) requestLabel = initialSchedule ? 'Save Schedule' : 'Schedule';

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title={resolvedTitle}
      open={isOpen}
      onClose={onCancel}
    >
      {showDisclaimer && (
        <DisclaimerContent
          dontShowAgainDisclaimerChecked={dontShowAgainDisclaimerChecked}
          setDontShowAgainDisclaimerChecked={setDontShowAgainDisclaimerChecked}
          operationText={operationText}
        />
      )}
      {!showDisclaimer && (
        <>
          <p className="text-gray-500 text-sm font-normal tracking-wide pb-3">
            {description}
          </p>
          {children}
          {schedulable && (
            <ScheduleFields
              form={scheduleForm}
              allowNow={!initialSchedule}
              onChange={setScheduleForm}
            />
          )}
        </>
      )}
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="default-fit"
          className="inline-block mx-0.5 border-green-500 border w-fit"
          size="small"
          disabled={
            showDisclaimer
              ? false
              : requestDisabled || !isScheduleFormValid(scheduleForm)
          }
          onClick={resolvedOnProceedClick}
        >
          {showDisclaimer ? 'Proceed' : requestLabel}
        </Button>
        {!showDisclaimer && initialSchedule && onCancelSchedule && (
          <Button
            type="danger"
            size="small"
            className="inline-block mx-0.5 w-fit"
            onClick={onCancelSchedule}
          >
            Cancel Schedule
          </Button>
        )}
        <Button
          type="primary-white-fit"
          className="inline-block mx-0.5 border-green-500 border"
          size="small"
          onClick={() => {
            onCancel();
            setDontShowAgainDisclaimerChecked(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default OperationModal;
