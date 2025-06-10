interface Outcome {
  metric: string;
  label: string;
  icon: string;
}

interface OutcomesSectionProps {
  title?: string;
  subtitle?: string;
  outcomes?: Outcome[];
  primaryColor?: string;
  id?: string;
}

export default function OutcomesSection({
  title,
  subtitle,
  outcomes = [],
  primaryColor = '#7C3AED',
  id,
}: OutcomesSectionProps) {
  return (
    <section id={id} className='py-16 bg-gray-50'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>{title}</h2>
            <p className='text-lg text-gray-600'>{subtitle}</p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            {outcomes.map((outcome, index) => {
              return (
                <div key={index} className='text-center'>
                  <div className='mb-4'>
                    <div
                      className='w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl'
                      style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                    >
                      {outcome.icon}
                    </div>
                  </div>
                  <div className='text-3xl font-bold mb-2' style={{ color: primaryColor }}>
                    {outcome.metric}
                  </div>
                  <div className='text-gray-600 font-medium'>{outcome.label}</div>
                </div>
              );
            })}
          </div>

          <div className='mt-12 text-center'>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              These numbers represent our commitment to delivering exceptional results for every
              client. Your success is our success.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
