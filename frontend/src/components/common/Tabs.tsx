import React from 'react';

type Props = {
  tabs: Array<{ id: string; label: string; name: string; content: React.ReactNode }>;
  activeTab: string;
  setActiveTab: (tabId: string) => void;
};

const Tabs = ({ tabs, activeTab, setActiveTab }: Props) => {
  return (
    <div className="w-full">
      <div className="relative border-b-2 border-slate-100">
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 pb-4 text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900 cursor-pointer'} `}
            >
              <span className="relative z-10">{tab.label}</span>
              {activeTab === tab.id && (
                <>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-500 via-emerald-500 to-teal-500 rounded-full shadow=lg shadow-emerald-500/25" />
                  <div className="absolute inset-0 bg-linear-to-b from-emerald-50/50 to-transparent rounded-t-xl -z-10" />
                </>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-6">
        {tabs.map((tab) => {
          if (tab.id === activeTab) {
            return <div key={tab.id}>{tab.content}</div>;
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Tabs;
