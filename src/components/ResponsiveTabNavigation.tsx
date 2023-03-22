// ResponsiveTabNavigation.tsx
import React, { useState } from "react";
import "./ResponsiveTabNavigation.css";

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface ResponsiveTabNavigationProps {
  tabs: Tab[];
}

const ResponsiveTabNavigation: React.FC<ResponsiveTabNavigationProps> = ({
  tabs,
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTabIndex(index);
  };

  return (
    <div className="tab-navigation">
      <div className="tab-navigation-header">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-navigation-button ${
              index === activeTabIndex ? "active" : ""
            }`}
            onClick={() => handleTabClick(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-navigation-content">
        {tabs[activeTabIndex] && tabs[activeTabIndex].content}
      </div>
    </div>
  );
};

export default ResponsiveTabNavigation;
