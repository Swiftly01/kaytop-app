interface IconProps {
  className?: string;
  color?: string;
}

export const DotsVerticalIcon: React.FC<IconProps> = ({ 
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
      d="M10.0001 10.8333C10.4603 10.8333 10.8334 10.4602 10.8334 9.99999C10.8334 9.53975 10.4603 9.16666 10.0001 9.16666C9.53984 9.16666 9.16675 9.53975 9.16675 9.99999C9.16675 10.4602 9.53984 10.8333 10.0001 10.8333Z"
      stroke={color}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.0001 5.00001C10.4603 5.00001 10.8334 4.62691 10.8334 4.16668C10.8334 3.70644 10.4603 3.33334 10.0001 3.33334C9.53984 3.33334 9.16675 3.70644 9.16675 4.16668C9.16675 4.62691 9.53984 5.00001 10.0001 5.00001Z"
      stroke={color}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.0001 16.6667C10.4603 16.6667 10.8334 16.2936 10.8334 15.8333C10.8334 15.3731 10.4603 15 10.0001 15C9.53984 15 9.16675 15.3731 9.16675 15.8333C9.16675 16.2936 9.53984 16.6667 10.0001 16.6667Z"
      stroke={color}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
