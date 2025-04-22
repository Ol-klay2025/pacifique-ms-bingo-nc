import React from 'react';

export const Tabs = ({ children, defaultValue, onValueChange, className = '' }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (onValueChange) onValueChange(value);
  };

  // Filter children to get only Tab components for the header
  const tabHeaders = React.Children.map(children, (child) => {
    if (child.type.name === 'Tab') {
      const { value, label } = child.props;
      return (
        <button
          key={value}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
            activeTab === value 
              ? 'bg-white border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
          }`}
          onClick={() => handleTabChange(value)}
        >
          {label}
        </button>
      );
    }
    return null;
  });

  // Filter and render the content of the active tab
  const activeContent = React.Children.map(children, (child) => {
    if (child.type.name === 'Tab' && child.props.value === activeTab) {
      return child.props.children;
    }
    return null;
  });

  return (
    <div className={`tabs-container ${className}`}>
      <div className="tabs-header flex border-b space-x-1">
        {tabHeaders}
      </div>
      <div className="tabs-content p-4 bg-white">
        {activeContent}
      </div>
    </div>
  );
};

export const Tab = ({ value, label, children }) => {
  // This component doesn't render anything directly
  // It's used as a data container for the Tabs component
  return null;
};