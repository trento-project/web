import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import classNames from 'classnames';
import React from 'react';

function Modal({ children, open, onClose, title, className }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-white/60 backdrop-blur-sm duration-300 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className={classNames(
            'max-w-lg space-y-4 bg-white p-12 duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0',
            className
          )}
        >
          <DialogTitle className="text-xl font-semibold leading-6 text-gray-900">
            {title}
          </DialogTitle>
          <div className="mt-2">{children}</div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default Modal;
