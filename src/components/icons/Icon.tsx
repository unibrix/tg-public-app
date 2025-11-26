import { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const createIcon = (path: React.ReactNode) => {
  return function Icon({ size = 28, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {path}
      </svg>
    );
  };
};
