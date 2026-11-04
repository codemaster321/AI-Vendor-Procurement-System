import { Link } from 'react-router-dom';

const Logo = ({ to = '/', size = 'md', showName = true, className = '' }) => {
    const box = size === 'sm' ? 'h-7 w-7 rounded-md' : 'h-8 w-8 rounded-lg';
    return (
        <Link to={to} className={`flex items-center gap-2.5 ${className}`}>
            <span className={`${box} overflow-hidden border border-line bg-[#f4efe8]`}>
                <img src="/logo.jpg" alt="" className="h-full w-full scale-[1.55] object-cover" />
            </span>
            {showName && (
                <span className="text-[15px] font-semibold tracking-tight text-ink">
                    RFP<span className="text-accent">/</span>Manager
                </span>
            )}
        </Link>
    );
};

export default Logo;
