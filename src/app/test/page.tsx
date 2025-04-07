import Image from 'next/image';

export default function TestPage() {
  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>Image Test Page</h1>

      <div className='space-y-8'>
        <div>
          <h2 className='text-xl mb-2'>Next.js Image Component:</h2>
          <Image
            src='/invoices/invoice-hero.png'
            alt='Test image'
            width={400}
            height={300}
            className='border border-red-500'
            priority
          />
        </div>

        <div>
          <h2 className='text-xl mb-2'>Regular img tag:</h2>
          <img
            src='/invoices/invoice-hero.png'
            alt='Test image'
            className='border border-red-500'
            style={{ width: '400px', height: '300px' }}
          />
        </div>
      </div>
    </div>
  );
}
