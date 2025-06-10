interface Milestone {
  year: string;
  event: string;
}

interface Story {
  founding: string;
  mission: string;
  vision: string;
  values: string[];
  milestones: Milestone[];
}

interface StorySectionProps {
  title?: string;
  subtitle?: string;
  story?: Story;
  primaryColor?: string;
  id?: string;
}

export default function StorySection({
  title,
  subtitle,
  story,
  primaryColor = '#7C3AED',
  id,
}: StorySectionProps) {
  if (!story) return null;

  return (
    <section id={id} className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>{title}</h2>
            <p className='text-lg text-gray-600'>{subtitle}</p>
          </div>

          <div className='grid md:grid-cols-2 gap-12 mb-12'>
            <div>
              <div className='mb-8'>
                <h3 className='text-xl font-semibold mb-3' style={{ color: primaryColor }}>
                  Our Mission
                </h3>
                <p className='text-gray-600'>{story.mission}</p>
              </div>

              <div className='mb-8'>
                <h3 className='text-xl font-semibold mb-3' style={{ color: primaryColor }}>
                  Our Vision
                </h3>
                <p className='text-gray-600'>{story.vision}</p>
              </div>

              <div>
                <h3 className='text-xl font-semibold mb-3' style={{ color: primaryColor }}>
                  Our Values
                </h3>
                <div className='grid grid-cols-2 gap-2'>
                  {story.values.map((value, index) => {
                    return (
                      <div key={index} className='flex items-center'>
                        <span className='mr-2' style={{ color: primaryColor }}>
                          ●
                        </span>
                        <span className='text-gray-600'>{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-xl font-semibold mb-6' style={{ color: primaryColor }}>
                Our Journey
              </h3>
              <div className='space-y-4'>
                {story.milestones.map((milestone, index) => {
                  return (
                    <div key={index} className='flex items-start'>
                      <div
                        className='w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0'
                        style={{ backgroundColor: primaryColor }}
                      >
                        {milestone.year}
                      </div>
                      <div className='pt-2'>
                        <p className='text-gray-600'>{milestone.event}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className='text-center'>
            <div
              className='inline-block px-6 py-2 rounded-full text-white font-semibold'
              style={{ backgroundColor: primaryColor }}
            >
              Founded in {story.founding}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
