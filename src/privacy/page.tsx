import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for our services',
};

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold text-foreground mb-8'>Privacy Policy</h1>

        <div className='prose prose-lg dark:prose-invert max-w-none'>
          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>1. Information We Collect</h2>
            <p className='text-muted-foreground'>
              We collect information that you provide directly to us, including when you create an
              account, use our services, or communicate with us. This may include:
            </p>
            <ul className='list-disc pl-6 mt-4 text-muted-foreground'>
              <li>Name and contact information</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Usage data and preferences</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>2. How We Use Your Information</h2>
            <p className='text-muted-foreground'>We use the information we collect to:</p>
            <ul className='list-disc pl-6 mt-4 text-muted-foreground'>
              <li>Provide and maintain our services</li>
              <li>Process your transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Improve our services and develop new features</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>3. Information Sharing</h2>
            <p className='text-muted-foreground'>
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className='list-disc pl-6 mt-4 text-muted-foreground'>
              <li>Service providers who assist in our operations</li>
              <li>Professional advisors</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>4. Your Rights</h2>
            <p className='text-muted-foreground'>You have the right to:</p>
            <ul className='list-disc pl-6 mt-4 text-muted-foreground'>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>5. Contact Us</h2>
            <p className='text-muted-foreground'>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <a href='mailto:privacy@example.com' className='text-primary hover:underline'>
                privacy@example.com
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
