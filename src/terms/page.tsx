import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for our platform',
};

export default function TermsPage() {
  return (
    <div className='min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold text-foreground mb-8'>Terms of Service</h1>

        <div className='prose prose-lg dark:prose-invert max-w-none'>
          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>1. Acceptance of Terms</h2>
            <p className='text-muted-foreground'>
              By accessing and using our services, you agree to be bound by these Terms of Service
              and all applicable laws and regulations. If you do not agree with any of these terms,
              you are prohibited from using or accessing our services.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>2. Use License</h2>
            <p className='text-muted-foreground'>
              Permission is granted to temporarily access our services for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title, and
              under this license you may not:
            </p>
            <ul className='list-disc pl-6 mt-4 text-muted-foreground'>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>3. User Responsibilities</h2>
            <p className='text-muted-foreground'>As a user of our services, you agree to:</p>
            <ul className='list-disc pl-6 mt-4 text-muted-foreground'>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not engage in any unauthorized or harmful activities</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>4. Service Modifications</h2>
            <p className='text-muted-foreground'>
              We reserve the right to modify or discontinue, temporarily or permanently, our
              services with or without notice. We shall not be liable to you or any third party for
              any modification, suspension, or discontinuance of our services.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>5. Limitation of Liability</h2>
            <p className='text-muted-foreground'>
              In no event shall we be liable for any damages arising out of the use or inability to
              use our services, even if we have been notified of the possibility of such damages.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>6. Governing Law</h2>
            <p className='text-muted-foreground'>
              These terms shall be governed by and construed in accordance with the laws of the
              jurisdiction in which we operate, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>7. Contact Information</h2>
            <p className='text-muted-foreground'>
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              <a href='mailto:terms@example.com' className='text-primary hover:underline'>
                terms@example.com
              </a>
            </p>
          </section>

          <section className='text-sm text-muted-foreground'>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
