interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', vSize: 'text-sm' },
    md: { icon: 'w-9 h-9', text: 'text-xl', vSize: 'text-base' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', vSize: 'text-lg' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      {/* Icon */}
      <div className={`${s.icon} relative`}>
        {/* Main gradient background */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #7c6aab 0%, #635985 50%, #443C68 100%)',
          }}
        />
        {/* Decorative shine */}
        <div
          className="absolute inset-0 rounded-xl opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
          }}
        />
        {/* V letter */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${s.vSize} font-black text-white drop-shadow-sm`}>V</span>
        </div>
        {/* Subtle glow */}
        <div
          className="absolute -inset-1 rounded-xl opacity-30 blur-sm -z-10"
          style={{
            background: 'linear-gradient(135deg, #7c6aab, #635985)',
          }}
        />
      </div>

      {/* Text */}
      {showText && (
        <span
          className={`${s.text} font-bold`}
          style={{
            background: 'linear-gradient(135deg, #9181bd 0%, #635985 50%, #443C68 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Vipile
        </span>
      )}
    </div>
  );
}
