interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  id?: string;
}

export default function HeroSection({
  title,
  subtitle,
  buttonText,
  buttonUrl,
  primaryColor = '#7C3AED',
  secondaryColor = '#2563EB',
  id,
}: HeroSectionProps) {
  return (
    <section
      id={id}
      className='text-white py-20'
      style={{
        background: `linear-gradient(var(--color--tinted-100, #f8f5f2), var(--color-2, #fbfafa))`,
      }}
    >
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h1 className='text-5xl font-bold mb-6' style={{ color: 'var(--content--primary)' }}>
            {title}
          </h1>
          <p className='text-xl opacity-90 mb-8' style={{ color: 'var(--content--secondary)' }}>
            {subtitle}
          </p>
          <div className='space-x-4'>
            <button
              className='px-8 py-3 rounded-lg font-semibold transition-colors'
              style={{
                backgroundColor: 'var(--fill--brand)',
                color: 'var(--color--white)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--blue-hover)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--fill--brand)';
              }}
              onClick={() => {
                return buttonUrl && (window.location.href = buttonUrl);
              }}
            >
              {buttonText}
            </button>
            <button
              className='px-8 py-3 rounded-lg font-semibold transition-colors'
              style={{
                border: '2px solid var(--border--primary)',
                backgroundColor: 'transparent',
                color: 'var(--content--primary)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--state--hover)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
