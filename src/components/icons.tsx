import type { SVGProps } from 'react';

export function FemmoraLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10" />
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 2v20" />
      <path d="M22 12h-5" />
      <path d="M7 12H2" />
      <path d="M12 7V2" />
      <path d="M12 22v-5" />
    </svg>
  );
}
