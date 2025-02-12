import React from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import classNames from 'classnames';

function Modal({ children, open, onClose, title, className }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-white/60 backdrop-blur-sm duration-300 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 w-screen overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel
            transition
            className={classNames(
              'space-y-4 rounded-lg w-full max-w-7xl shadow-lg bg-white p-6 duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0',
              className
            )}
          >
            <DialogTitle className="text-xl font-semibold leading-6 text-gray-900">
              {title}
            </DialogTitle>
            <div className="mt-2">{children}</div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default Modal;
