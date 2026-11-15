
const Tabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="flex gap-6 overflow-x-auto border-b border-border">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onChange(tab.value)}
                    className={`shrink-0 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${activeTab === tab.value
                            ? "border-primary text-primary"
                            : "border-transparent text-text-secondary hover:text-text-primary"
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
