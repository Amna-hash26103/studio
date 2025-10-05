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
