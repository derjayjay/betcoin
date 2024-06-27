import React, { useState } from 'react';
export interface ToggleProps {
  onChangeState: (value: 'up' | 'down' | undefined) => void;
}

/**
 * Toggle component that allows the user to select between two options.
 */
export const Toggle: React.FC<ToggleProps> = ({ onChangeState }) => {
  const [selectedValue, setSelectedValue] = useState<'up' | 'down' | undefined>();

  const handleToggle = (value: 'up' | 'down' | undefined) => {
    setSelectedValue(value);
    onChangeState(value);
  };

  return (
    <div className="my-2 grid grid-cols-2 divide-x divide-white/15 h-12 rounded-lg border border-white/15 bg-white/5">
      <div
        className={`flex items-center justify-center w-full h-full rounded-l-lg ${
          selectedValue === 'up' ? 'bg-white text-zinc-950 font-bold' : 'bg-transparent'
        }`}
        onClick={() => handleToggle('up')}
      >
        Up
      </div>
      <div
        className={`flex items-center justify-center w-full h-full rounded-r-lg ${
          selectedValue === 'down' ? 'bg-white text-zinc-950 font-bold' : 'bg-transparent'
        }`}
        onClick={() => handleToggle('down')}
      >
        Down
      </div>
    </div>
  );
};
