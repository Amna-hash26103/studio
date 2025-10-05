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
        strokeWidth="1"
        d="M 100,100 a 25,25 0 1,1 50,0 a 25,25 0 1,1 -50,0 M 100,100 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 M 100,100 C 125,75 75,75 100,100 M 100,100 C 75,125 125,125 100,100 M 50,100 A 50,50 0 0,1 150,100"
      >
         <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 100 100"
          to="360 100 100"
          dur="45s"
          repeatCount="indefinite"
        />
      </path>
       <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        d="M 50,50 C 75,25 125,75 100,100 M 150,50 C 125,25 75,75 100,100 M 50,150 C 75,175 125,125 100,100 M 150,150 C 125,175 75,125 100,100"
      >
        <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 100 100"
            to="0 100 100"
            dur="60s"
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
        strokeWidth="0.8"
        d="M 20,80 C 40,20 80,20 80,80 M 50,50 C 20,20 80,80 50,50 M 50,50 C 20,80 80,20 50,50"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        d="M 20,20 C 40,80 80,80 80,20 M 50,50 C 20,80 80,20 50,50 M 50,50 C 20,20 80,80 50,50"
      />
    </svg>
  );
}
