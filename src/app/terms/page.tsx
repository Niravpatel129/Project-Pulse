import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for our platform',
};

export default function TermsPage() {
  return (
    <div className='min-h-screen bg-[#000000] text-[#f5f5f7] py-16 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-[980px] mx-auto'>
        <h1 className='text-[48px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-12'>
          Terms of Service
        </h1>

        <div className='space-y-12'>
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              1. Acceptance of Terms
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              By accessing or using Pulse, you agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any of these terms, you are
              prohibited from using or accessing our services.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              2. Use of Service
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              You agree to use our service only for lawful purposes and in accordance with these
              Terms. You agree not to:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Use automated systems or software to extract data from the service</li>
              <li>Engage in any activity that could disable, overburden, or impair the service</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              3. User Accounts
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              When you create an account using Google OAuth:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must notify us immediately of any unauthorized access</li>
              <li>We reserve the right to disable any account at any time</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              4. Service Modifications
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We reserve the right to modify or discontinue, temporarily or permanently, our
              services with or without notice. We shall not be liable to you or any third party for
              any modification, suspension, or discontinuance of our services.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              5. Termination
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We may terminate or suspend your access to our service immediately, without prior
              notice or liability, for any reason, including if you breach these Terms. Upon
              termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              6. Disclaimer of Warranties
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              The service is provided &quot;as is&quot; and &quot;as available&quot; without any
              warranties of any kind, either express or implied. We do not warrant that the service
              will be uninterrupted, timely, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              7. Limitation of Liability
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              In no event shall Pulse, its directors, employees, partners, agents, suppliers, or
              affiliates be liable for any indirect, incidental, special, consequential, or punitive
              damages, including without limitation, loss of profits, data, use, goodwill, or other
              intangible losses.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              8. Governing Law
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              These Terms shall be governed by and construed in accordance with the laws of the
              United States, without regard to its conflict of law provisions. Our failure to
              enforce any right or provision of these Terms will not be considered a waiver of those
              rights.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              9. Contact Information
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              <a
                href='mailto:terms@pulse.com'
                className='text-[#2997ff] hover:text-[#0077ed] transition-colors'
              >
                terms@pulse.com
              </a>
            </p>
          </section>

          <section className='text-[14px] text-[#86868b] font-[400] tracking-[-0.01em]'>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
