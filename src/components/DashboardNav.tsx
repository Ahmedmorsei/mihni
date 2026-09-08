"use client";

export type DashboardTab = "overview" | "billing" | "settings";

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "billing", label: "Billing" },
  { id: "settings", label: "Account Settings" },
];

export default function DashboardNav({
  activeTab,
  onChange,
}: {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Dashboard sections"
      className="w-full max-w-sm flex items-center gap-1 mb-4 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
              isActive
                ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
