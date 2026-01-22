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

function DisclaimerContent({
  dontShowAgainDisclaimerChecked,
  setDontShowAgainDisclaimerChecked,
  operationText,
}) {
  return (
    <>
      <Banner type="warning" iconSize="l" truncate={false}>
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
  onRequest = noop,
  onCancel = noop,
  children,
}) {
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

  const resolvedOnProceedClick = showDisclaimer
    ? maybeWaiveDisclaimerAndContinue
    : onRequest;

  useEffect(() => {
    isOpen && setShowDisclaimer(shouldShowOperationDisclaimer());
  }, [isOpen]);

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
        </>
      )}
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="default-fit"
          className="inline-block mx-0.5 border-green-500 border w-fit"
          size="small"
          disabled={showDisclaimer ? false : requestDisabled}
          onClick={resolvedOnProceedClick}
        >
          {showDisclaimer ? 'Proceed' : 'Request'}
        </Button>
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
