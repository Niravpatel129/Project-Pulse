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
        background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
      }}
    >
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h1 className='text-5xl font-bold mb-6'>{title}</h1>
          <p className='text-xl opacity-90 mb-8'>{subtitle}</p>
          <div className='space-x-4'>
            <button
              className='bg-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors'
              style={{ color: primaryColor }}
              onClick={() => {
                return buttonUrl && (window.location.href = buttonUrl);
              }}
            >
              {buttonText}
            </button>
            <button
              className='border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white transition-colors'
              onMouseOver={(e) => {
                return (e.currentTarget.style.color = primaryColor);
              }}
              onMouseOut={(e) => {
                return (e.currentTarget.style.color = 'white');
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
