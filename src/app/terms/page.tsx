import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for our platform',
};

export default function TermsPage() {
  return (
    <div className='min-h-screen bg-[#000000] text-[#f5f5f7] py-16 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-[980px] mx-auto'>
        <h1 className='text-[48px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-4'>
          Terms of Service
        </h1>
        <p className='text-[14px] text-[#86868b] font-[400] tracking-[-0.01em] mb-12'>
          Effective Date: {new Date().toLocaleDateString()}
        </p>

        <div className='space-y-12'>
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              1. Acceptance of Terms
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              By accessing or using Hour Block, you agree to be bound by these Terms of Service and
              all applicable laws and regulations. If you do not agree with any of these terms, you
              are prohibited from using or accessing our services.
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
              In no event shall Hour Block, its directors, employees, partners, agents, suppliers,
              or affiliates be liable for any indirect, incidental, special, consequential, or
              punitive damages, including without limitation, loss of profits, data, use, goodwill,
              or other intangible losses.
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

          {/* 9. Intellectual Property */}
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              9. Intellectual Property
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              All content, features, and functionality of Hour Block—including but not limited to
              software, text, graphics, logos, and trademarks—are the exclusive property of Hour
              Block or its licensors. You are granted a limited, non-exclusive, non-transferable,
              and revocable license to access and use the service for its intended purpose. No
              right, title, or interest in or to the service is transferred to you.
            </p>
          </section>

          {/* 10. Subscription and Fees */}
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              10. Subscription and Fees
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              Certain features of the service may require payment of fees. Prices, billing cycles,
              and acceptable payment methods will be disclosed at the point of purchase. All fees
              are exclusive of taxes, which will be billed in addition where applicable. Payments
              are non-refundable except as required by law or expressly stated otherwise. We may
              change the subscription plan fees with at least 30&nbsp;days&apos; advance notice.
            </p>
          </section>

          {/* 11. User-Generated Content */}
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              11. User-Generated Content
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              You retain ownership of any data, files, or other materials you upload to the service
              (&quot;User Content&quot;). By submitting User Content, you grant Hour Block a
              worldwide, non-exclusive, royalty-free license to host, store, reproduce, and display
              that content for the purpose of operating and improving the service. You represent and
              warrant that you have all rights necessary to grant this license and that your User
              Content does not violate any law or the rights of any third party.
            </p>
          </section>

          {/* 12. Third-Party Services */}
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              12. Third-Party Services
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              The service may integrate with or link to third-party services (such as Google OAuth).
              Hour Block does not endorse and is not responsible for the practices, content, or
              availability of such third-party services. Use of third-party services is governed
              solely by the terms of those services.
            </p>
          </section>

          {/* 13. Privacy */}
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              13. Privacy
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              Your use of the service is also subject to our&nbsp;
              <Link
                href='/privacy'
                className='text-[#2997ff] hover:text-[#0077ed] transition-colors underline'
              >
                Privacy Policy
              </Link>
              . By using the service, you consent to the collection and use of your information as
              described therein.
            </p>
          </section>

          {/* 14. Indemnification */}
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              14. Indemnification
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              You agree to indemnify, defend, and hold harmless Hour Block and its affiliates from
              and against any claims, damages, obligations, losses, liabilities, costs, or debt
              arising from your use of the service or violation of these Terms.
            </p>
          </section>

          {/* 15. Dispute Resolution */}
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              15. Dispute Resolution
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              Any dispute arising out of or relating to these Terms or the service shall be resolved
              through binding arbitration administered by the American Arbitration Association in
              accordance with its Commercial Arbitration Rules. You and Hour Block waive the right
              to a jury trial and to participate in class actions. Either party may seek injunctive
              relief in any court of competent jurisdiction to protect its intellectual property
              rights.
            </p>
          </section>

          {/* 16. Changes to Terms */}
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              16. Changes to Terms
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We may revise these Terms at any time by posting an updated version on this page.
              Continued use of the service after any such changes constitutes your acceptance of the
              revised Terms. If you do not agree to the new Terms, you must stop using the service.
            </p>
          </section>

          {/* 17. Severability */}
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              17. Severability
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              If any provision of these Terms is held to be unenforceable, that provision will be
              modified to the minimum extent necessary so that these Terms will otherwise remain in
              full force and effect.
            </p>
          </section>

          {/* 18. Entire Agreement & Assignment */}
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              18. Entire Agreement &amp; Assignment
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              These Terms constitute the entire agreement between you and Hour Block regarding the
              service and supersede all prior agreements. We may assign our rights and obligations
              under these Terms without notice; you may not assign your rights under these Terms
              without our prior written consent.
            </p>
          </section>

          {/* 19. Contact Information */}
          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              19. Contact Information
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              <a
                href='mailto:terms@hourblock.com'
                className='text-[#2997ff] hover:text-[#0077ed] transition-colors'
              >
                terms@hourblock.com
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
