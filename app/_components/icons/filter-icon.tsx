interface IconProps {
  className?: string;
  color?: string;
}

export const FilterIcon: React.FC<IconProps> = ({ 
  className, 
  color = 'currentColor' 
}) => (
  <svg
    width="17"
    height="12"
    viewBox="0 0 17 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M3.33331 5.8335H13.3333M0.833313 0.833496H15.8333M5.83331 10.8335H10.8333"
      stroke={color}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
