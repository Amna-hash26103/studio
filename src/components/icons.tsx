
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function FemmoraLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
    const logoImage = PlaceHolderImages.find((img) => img.id === 'logo');
    if (!logoImage) return null;

    return (
        <div className={cn("relative", className)}>
            <Image
                src={logoImage.imageUrl}
                alt={logoImage.description}
                data-ai-hint={logoImage.imageHint}
                width={100}
                height={100}
                className="h-full w-full"
            />
        </div>
    );
}
