import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const SelectContext = createContext(null);

export const Select = ({ children, defaultValue = '', onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const containerRef = useRef(null);

  const handleSelect = (val) => {
    setValue(val);
    if (onValueChange) onValueChange(val);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <SelectContext.Provider value={{ value, handleSelect, isOpen, setIsOpen }}>
      <div ref={containerRef} className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, className = '', ...props }) => {
  const { value, isOpen, setIsOpen } = useContext(SelectContext);

  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className} ${isOpen ? 'ring-2 ring-blue-600 ring-offset-2' : ''}`}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );
};

export const SelectValue = ({ placeholder, children, ...props }) => {
  const { value } = useContext(SelectContext);
  
  return (
    <span {...props}>
      {value ? children : placeholder}
    </span>
  );
};

export const SelectContent = ({ children, className = '', ...props }) => {
  const { isOpen } = useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-full left-0 z-50 mt-1 min-w-[8rem] w-full overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md animate-in fade-in-80 ${className}`}
      {...props}
    >
      <div className="max-h-96 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export const SelectItem = ({ value, children, className = '', ...props }) => {
  const { value: selectedValue, handleSelect } = useContext(SelectContext);
  const isSelected = selectedValue === value;
  
  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 ${isSelected ? 'bg-gray-100 font-medium' : ''} ${className}`}
      onClick={() => handleSelect(value)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </span>
      {children}
    </div>
  );
};