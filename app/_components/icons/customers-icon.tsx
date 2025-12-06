interface IconProps {
  className?: string;
  color?: string;
}

export const CustomersIcon: React.FC<IconProps> = ({ 
  className, 
  color = 'currentColor' 
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M9 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V14.2C1 15.8802 1 16.7202 1.32698 17.362C1.6146 17.9265 2.07354 18.3854 2.63803 18.673C3.27976 19 4.11984 19 5.8 19H14.2C15.8802 19 16.7202 19 17.362 18.673C17.9265 18.3854 18.3854 17.9265 18.673 17.362C19 16.7202 19 15.8802 19 14.2V11M10 6H14V10M13.5 1.5V0M17.4393 2.5607L18.5 1.5M18.5103 6.5H20.0103M1 11.3471C1.6519 11.4478 2.3199 11.5 3 11.5C7.38636 11.5 11.2653 9.32764 13.6197 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
