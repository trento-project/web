import React from 'react';

export function MessageBubble({ variant, children }) {
  if (variant === 'user') {
    return (
      <div className="rounded-lg bg-[#e8f5ef] px-5 py-4">
        <div className="mb-1.5 font-semibold text-[#208b57] text-base">You</div>
        <div className="break-words text-gray-800 text-base">{children}</div>
      </div>
    );
  }

  return (
    <div className="bg-white px-5 py-4">
      <div className="break-words text-gray-800 text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
}
