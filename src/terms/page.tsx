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
              By accessing and using our services, you agree to be bound by these Terms of Service
              and all applicable laws and regulations. If you do not agree with any of these terms,
              you are prohibited from using or accessing our services.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              2. Use License
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              Permission is granted to temporarily access our services for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title, and
              under this license you may not:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              3. User Responsibilities
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              As a user of our services, you agree to:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not engage in any unauthorized or harmful activities</li>
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
              5. Limitation of Liability
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              In no event shall we be liable for any damages arising out of the use or inability to
              use our services, even if we have been notified of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              6. Governing Law
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              These terms shall be governed by and construed in accordance with the laws of the
              jurisdiction in which we operate, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              7. Contact Information
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              <a
                href='mailto:terms@example.com'
                className='text-[#2997ff] hover:text-[#0077ed] transition-colors'
              >
                terms@example.com
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
