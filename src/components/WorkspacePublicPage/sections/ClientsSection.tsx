interface Client {
  name: string;
  logo: string;
}

interface ClientsSectionProps {
  title?: string;
  subtitle?: string;
  clients?: Client[];
  id?: string;
}

export default function ClientsSection({ title, subtitle, clients = [], id }: ClientsSectionProps) {
  return (
    <section id={id} className='py-16 bg-gray-50'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-4'>{title}</h2>
          <p className='text-lg text-gray-600 mb-12'>{subtitle}</p>

          <div className='grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center'>
            {clients.map((client, index) => {
              return (
                <div key={index} className='flex flex-col items-center space-y-2'>
                  <div className='w-20 h-20 bg-white rounded-lg shadow-md flex items-center justify-center'>
                    <span className='text-2xl font-bold text-gray-600'>
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <span className='text-sm text-gray-500 font-medium'>{client.name}</span>
                </div>
              );
            })}
          </div>

          <div className='mt-12 text-center'>
            <p className='text-gray-600'>
              Join these industry leaders who trust us with their digital transformation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
