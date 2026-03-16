import type { ImgHTMLAttributes } from 'react';
import astraLogo from '../assets/ASTRA_logo.png';

export default function ApplicationLogo({ alt = 'Astra', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return <img {...props} src={astraLogo} alt={alt} />;
}
