import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

const logoImage = PlaceHolderImages.find((img) => img.id === 'logo');

export function FemmoraLogo(props: SVGProps<SVGSVGElement>) {
  if (!logoImage) {
    return null;
  }
  return (
    <div className={cn("relative", props.className)}>
        <Image
          src={logoImage.imageUrl}
          alt={logoImage.description}
          data-ai-hint={logoImage.imageHint}
          width={100}
          height={100}
        />
    </div>
  );
}

export function BohoShapeOne(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 541 391"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g opacity="0.6">
        <path
          d="M270.5 390.999C420.264 390.999 541 303.461 541 195.5C541 87.5391 420.264 0 270.5 0C120.736 0 0 87.5391 0 195.5C0 303.461 120.736 390.999 270.5 390.999Z"
          fill="currentColor"
          className="text-muted"
        />
        <path
          d="M399.277 151.045C399.277 151.045 348.643 207.973 348.643 247.781C348.643 287.589 399.277 344.517 399.277 344.517"
          stroke="#1E1E1E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M399.277 247.781C399.277 247.781 449.911 207.973 449.911 247.781C449.911 287.589 399.277 344.517 399.277 344.517"
          stroke="#1E1E1E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M399.277 247.781C399.277 247.781 373.96 230.377 373.96 247.781C373.96 265.185 399.277 344.517 399.277 344.517"
          stroke="#1E1E1E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M399.277 247.781C399.277 247.781 424.594 230.377 424.594 247.781C424.594 265.185 399.277 344.517 399.277 344.517"
          stroke="#1E1919"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M399.277 344.517V391"
          stroke="#1E1E1E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M399.277 151.045V46.4834"
          stroke="#1E1E1E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function BohoShapeTwo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 541 391"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g opacity="0.6">
        <path
          d="M270.5 391C121.12 391 0 303.461 0 195.5C0 87.5391 121.12 0 270.5 0C419.88 0 541 87.5391 541 195.5C541 303.461 419.88 391 270.5 391Z"
          fill="currentColor"
        />
        <path
          d="M331.062 173.32C318.529 173.32 308.242 183.033 308.242 195.5C308.242 207.967 318.529 217.68 331.062 217.68C343.595 217.68 353.882 207.967 353.882 195.5C353.882 183.033 343.595 173.32 331.062 173.32Z"
          stroke="black"
          strokeWidth="1.5"
          strokeMiterlimit="10"
        />
        <path
          d="M331.062 173.32C337.429 152.183 355.239 126.233 379.792 124.99C407.039 123.593 422.565 149.035 417.422 174.633C412.279 200.231 385.032 219.098 357.785 220.495C330.539 221.892 324.695 194.383 331.062 173.32Z"
          stroke="black"
          strokeWidth="1.5"
          strokeMiterlimit="10"
        />
        <path
          d="M308.242 195.5C299.022 183.033 277.859 167.05 259.429 174.633C240.999 182.217 236.482 204.448 247.999 220.495C259.515 236.542 284.142 242.81 302.572 235.227C321.002 227.643 317.462 207.967 308.242 195.5Z"
          stroke="black"
          strokeWidth="1.5"
          strokeMiterlimit="10"
        />
        <path
          d="M331.062 217.68C337.429 238.817 355.239 264.767 379.792 266.01C407.039 267.407 422.565 241.965 417.422 216.367C412.279 190.769 385.032 171.902 357.785 170.505C330.539 169.108 324.695 196.617 331.062 217.68Z"
          stroke="black"
          strokeWidth="1.5"
          strokeMiterlimit="10"
        />
        <path
          d="M308.242 195.5C299.022 207.967 277.859 223.95 259.429 216.367C240.999 208.783 236.482 186.552 247.999 170.505C259.515 154.458 284.142 148.19 302.572 155.773C321.002 163.357 317.462 183.033 308.242 195.5Z"
          stroke="black"
          strokeWidth="1.5"
          strokeMiterlimit="10"
        />
      </g>
    </svg>
  );
}