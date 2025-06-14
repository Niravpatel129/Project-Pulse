import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for our services',
};

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-[#000000] text-[#f5f5f7] py-16 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-[980px] mx-auto'>
        <h1 className='text-[48px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-12'>
          Privacy Policy
        </h1>

        <div className='space-y-12'>
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              Introduction
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              At Hour Block, we take your privacy seriously. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use our service.
              Please read this privacy policy carefully. If you do not agree with the terms of this
              privacy policy, please do not access the service.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              1. Information We Collect
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              When you sign in using Google OAuth, we collect the following information:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Your Google account email address</li>
              <li>Your name</li>
              <li>Your profile picture</li>
              <li>Basic profile information provided by Google</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              2. How We Use Your Information
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We use the information we collect to:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Authenticate your identity and provide access to our services</li>
              <li>Personalize your experience</li>
              <li>Maintain and improve our services</li>
              <li>Send you important updates and notifications</li>
              <li>Protect against unauthorized access and fraud</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              3. Data Storage and Security
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We implement appropriate technical and organizational security measures to protect
              your personal information. Your data is stored on secure servers and is encrypted
              during transmission. We regularly review and update our security practices to ensure
              the safety of your information.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              4. Data Sharing and Third Parties
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We do not sell or rent your personal information to third parties. We may share your
              information only in the following circumstances:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>With service providers who assist in our operations</li>
              <li>When required by law or legal process</li>
              <li>To protect our rights and prevent fraud</li>
            </ul>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059] mt-4'>
              We use Google OAuth for authentication. Google&apos;s privacy policy is available at:{' '}
              <a
                href='https://policies.google.com/privacy'
                className='text-[#2997ff] hover:text-[#0077ed] transition-colors'
                target='_blank'
                rel='noopener noreferrer'
              >
                https://policies.google.com/privacy
              </a>
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              5. Your Rights and Control
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              You have the right to:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Access your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw your consent at any time</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              6. Contact Us
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              If you have any questions about this Privacy Policy or our data practices, please
              contact us at:
              <br />
              <a
                href='mailto:privacy@hourblock.com'
                className='text-[#2997ff] hover:text-[#0077ed] transition-colors'
              >
                privacy@hourblock.com
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
