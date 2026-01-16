interface EmptyStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({ title, message, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon || (
        <svg
          className="w-16 h-16 text-[#D0D5DD] mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      <h3 className="text-lg font-semibold text-[#101828] mb-2">{title}</h3>
      <p className="text-sm text-[#475467] mb-6 max-w-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium text-[#7F56D9] bg-white border border-[#7F56D9] rounded-lg hover:bg-[#F4F3FF] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
