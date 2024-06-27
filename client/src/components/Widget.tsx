import React from 'react';

export interface WidgetProps {
  title: string;
  content: string;
  status: string;
}

/**
 * A customizable widget component.
 */
export const Widget: React.FC<WidgetProps> = ({ title, content, status }) => {
  return (
    <div>
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{content}</div>
      <div className="mt-3 text-sm/6 sm:text-s/6 text-zinc-500">{status}</div>
      <hr className="w-full border-t border-white/10" />
    </div>
  );
};
