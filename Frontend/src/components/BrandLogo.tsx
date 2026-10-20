import { Link } from '@/router/Router';

export function BrandMark({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <img
      src="/logo.jpeg"
      alt="MARBOU"
      className={`${className} object-contain`}
    />
  );
}

export function BrandLogo({ size = 'md', onClick }: { size?: 'sm' | 'md'; onClick?: () => void }) {
  const h = size === 'sm' ? 'h-8' : 'h-10';
  return (
    <Link to="/" onClick={onClick} className="flex items-center shrink-0">
      <img
        src="/logo.jpeg"
        alt="MARBOU"
        className={`${h} w-auto object-contain`}
      />
    </Link>
  );
}
