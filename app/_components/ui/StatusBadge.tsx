/**
 * StatusBadge Component
 * Displays loan status with colored indicator dot and text
 */

interface StatusBadgeProps {
  status: string; // More flexible to handle various status formats
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    pending: {
      container: 'bg-[#FEF3F2] text-[#B42318]',
      dot: 'bg-[#B42318]'
    },
    approved: {
      container: 'bg-[#EFF8FF] text-[#175CD3]',
      dot: 'bg-[#175CD3]'
    },
    disbursed: {
      container: 'bg-[#F0F9FF] text-[#0369A1]',
      dot: 'bg-[#0369A1]'
    },
    active: {
      container: 'bg-[#ECFDF3] text-[#027A48]',
      dot: 'bg-[#027A48]'
    },
    scheduled: {
      container: 'bg-[rgba(255,147,38,0.1)] text-[#FF9326]',
      dot: 'bg-[#FF9326]'
    },
    completed: {
      container: 'bg-[#F3F4F6] text-[#374151]',
      dot: 'bg-[#374151]'
    },
    defaulted: {
      container: 'bg-[#FEF3F2] text-[#E91F11]',
      dot: 'bg-[#E91F11]'
    },
    overdue: {
      container: 'bg-[#FEF3F2] text-[#E91F11]',
      dot: 'bg-[#E91F11]'
    }
  };

  // Normalize status to lowercase to handle case variations
  const normalizedStatus = status?.toLowerCase() as keyof typeof styles;
  const style = styles[normalizedStatus] || styles.active; // Default to active if status not found
  
  // Format status text for display
  const formatStatusText = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'disbursed': return 'Disbursed';
      case 'active': return 'Active';
      case 'scheduled': return 'Scheduled';
      case 'completed': return 'Completed';
      case 'defaulted': return 'Defaulted';
      case 'overdue': return 'Overdue';
      default: return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-[16px] ${style.container}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span className="text-xs font-medium">{formatStatusText(status)}</span>
    </div>
  );
}
