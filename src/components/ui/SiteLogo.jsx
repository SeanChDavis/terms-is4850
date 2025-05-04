import LogoColor from '@/assets/terms-logo-color.svg';
import LogoWhite from '@/assets/terms-logo-white.svg';
import {NavLink} from "react-router-dom";
import {useAuth} from '@/context/AuthContext';

const SiteLogo = ({variant = 'color', className = '', toDashboard = false}) => {
    const {role} = useAuth();
    const logoSrc = variant === 'white' ? LogoWhite : LogoColor;

    const logoElement = (
        <img
            src={logoSrc}
            alt="TERMS Logo"
            className={`h-9 w-auto ${className}`}
        />
    );

    return toDashboard ? (
        <NavLink to={`/${role}/dashboard`} className="flex items-center">
            {logoElement}
        </NavLink>
    ) : (
        logoElement
    );
};

export default SiteLogo;
