import LogoColor from '@/assets/terms-logo-color.svg';
import LogoWhite from '@/assets/terms-logo-white.svg';

const SiteLogo = ({ variant = 'color', className = '' }) => {
    const logoSrc = variant === 'white' ? LogoWhite : LogoColor;

    return (
        <img
            src={logoSrc}
            alt="TERMS Logo"
            className={`h-9 w-auto ${className}`}
        />
    );
};

export default SiteLogo;
