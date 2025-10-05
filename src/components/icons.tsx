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

export function FloralShapeOne(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M100,100 C50,50 50,150 100,100 M100,100 C150,50 150,150 100,100 M50,50 C25,75 75,125 100,100 M150,50 C175,75 125,125 100,100 M50,150 C25,125 75,75 100,100 M150,150 C175,125 125,75 100,100"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 100 100"
          to="360 100 100"
          dur="10s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

export function FloralShapeTwo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M 20,80 C 40,20 80,20 80,80"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M 20,80 C 0,60 40,60 50,50"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M 80,80 C 100,60 60,60 50,50"
      />
    </svg>
  );
}
