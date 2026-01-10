
export const ACTION_CONFIG = {
  approve: {
    title: "Approve Report",
    description: "Approve a specific report. Click proceed when you're ready.",
    triggerText: "Approve",
    submitText: "Approve",
    variant: "tertiary",
  },
  decline: {
    title: "Decline Report",
    description: "Decline this report and provide a reason.",
    triggerText: "Decline",
    submitText: "Decline",
    variant: "danger",
  },
} as const;