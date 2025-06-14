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
              Table of Contents
            </h2>
            <ol className='list-decimal pl-6 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Introduction</li>
              <li>Scope of this Privacy Notice</li>
              <li>Personal data we collect</li>
              <li>How we use your personal data</li>
              <li>How we share your personal data</li>
              <li>Your choices</li>
              <li>Other sites and services</li>
              <li>Security and Retention</li>
              <li>International data transfers</li>
              <li>Children</li>
              <li>Changes to this Privacy Notice</li>
              <li>How to contact us</li>
              <li>California privacy notice</li>
              <li>Notice to European users</li>
              <li>Products and Services Privacy Notice</li>
              <li>Google User Data Privacy Notice</li>
            </ol>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              1. Introduction
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              This Privacy Notice describes how we handle personal data that we collect through our
              websites and mobile applications that link to this Privacy Notice (collectively, the
              &quot;Service&quot;), as well as through our marketing and other activities described
              in this Privacy Notice. Use of the Service is subject to our Terms of Service.
            </p>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059] mt-4'>
              California residents: See our California privacy notice for information about your
              personal information and privacy rights.
            </p>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059] mt-4'>
              Individuals in the EEA/UK/Switzerland: See our Notice to European users for
              information about your personal data and data protection rights.
            </p>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059] mt-4'>
              If you have any questions or concerns about our use of your personal data, please
              contact us.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              2. Scope of this Privacy Notice
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We provide businesses with a cloud-based communication hub that their teams use for
              customer-related communications. The Service is not intended for use by individuals
              for personal, family, household, or other consumer purposes, and the personal data
              covered by this Privacy Notice pertains to individuals acting in a business or
              commercial capacity. This Privacy Notice does not apply to personal data about our
              personnel or job candidates, or to personal data that we process on behalf of
              customers in our capacity as a processor or service provider.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              3. Personal data we collect
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              The personal data we collect from you, either directly or indirectly, will depend on
              how you interact with us and with our Service. We collect personal data about you from
              the following sources:
            </p>
            <h3 className='text-[21px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mt-6 mb-4'>
              Information you provide to us
            </h3>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              Personal data you may provide to us through the Service includes:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Contact data (name, email, phone number, etc.)</li>
              <li>Account data (profile information, preferences)</li>
              <li>Transaction data (payment information)</li>
              <li>Communications data (messages, feedback)</li>
              <li>Security data (when visiting our offices)</li>
              <li>Referral data (when you refer others)</li>
            </ul>

            <h3 className='text-[21px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mt-6 mb-4'>
              Information automatically collected
            </h3>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              As you navigate the Service, we automatically collect:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Device data (browser type, operating system, etc.)</li>
              <li>Usage data (page views, time spent, etc.)</li>
              <li>Location data (general location based on IP)</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <h3 className='text-[21px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mt-6 mb-4'>
              Information from third parties
            </h3>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We may receive information about you from:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Business partners and service providers</li>
              <li>Public sources and social media</li>
              <li>Authentication services (Google, Microsoft)</li>
              <li>Data brokers and analytics providers</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              4. How we use your personal data
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We use your personal data for the following purposes:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Service delivery and account management</li>
              <li>Business operations and system maintenance</li>
              <li>Research and development</li>
              <li>Marketing communications</li>
              <li>Targeted advertising</li>
              <li>Compliance and protection</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              5. How we share your personal data
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We may share your personal data with:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Our corporate affiliates</li>
              <li>Service providers and business partners</li>
              <li>Payment processors</li>
              <li>Authentication services</li>
              <li>Advertising partners</li>
              <li>Professional advisors</li>
              <li>Legal authorities when required</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              6. Your choices
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              You have certain rights regarding your personal data:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Access and update your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Request deletion of your data</li>
              <li>Control cookies and tracking</li>
              <li>Exercise your privacy rights under applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              7. Other sites and services
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              The Service may contain links to or integrations of websites and online services
              operated by third parties. These links are not endorsements of any third party. We do
              not control and are not responsible for the privacy practices of these third parties.
              We encourage you to review the privacy policies of any third-party sites or services
              you interact with.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              8. Security and Retention
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We implement appropriate technical and organizational security measures to protect
              your personal data. We retain your personal data for as long as necessary to fulfill
              the purposes for which we collected it, including for legal, accounting, or reporting
              requirements.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              9. International data transfers
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We are headquartered in the United States and may use service providers that operate
              in other countries. These countries may have different data protection laws than your
              country. We implement appropriate safeguards to protect your data when transferred
              internationally.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              10. Children
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              Our Service is not intended for use by anyone under 16 years of age. We do not
              knowingly collect personal data from children under 16.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              11. Changes to this Privacy Notice
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              We may update this Privacy Notice from time to time. We will notify you of any changes
              by posting the new Privacy Notice on this page and updating the &quot;Last
              updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              12. California Privacy Notice
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              This section applies to California residents and describes our collection, use, and
              disclosure of personal information under the California Consumer Privacy Act
              (&quot;CCPA&quot;).
            </p>
            <h3 className='text-[21px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mt-6 mb-4'>
              Your California Privacy Rights
            </h3>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              As a California resident, you have the right to:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Know what personal information we collect</li>
              <li>Access your personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of the sale of your personal information</li>
              <li>Non-discrimination for exercising your rights</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              13. Notice to European Users
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              This section applies to users in the European Economic Area (&quot;EEA&quot;), United
              Kingdom (&quot;UK&quot;), and Switzerland.
            </p>
            <h3 className='text-[21px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mt-6 mb-4'>
              Your European Privacy Rights
            </h3>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              Under the GDPR, you have the right to:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request erasure of your data</li>
              <li>Restrict processing of your data</li>
              <li>Data portability</li>
              <li>Object to processing</li>
              <li>Withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              14. Products and Services Privacy Notice
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              This section describes how we handle personal data as instructed by our customers in
              the course of providing certain features of our Services, including through cookies
              and similar technologies. We engage in the activities described here as a service
              provider to our customers and subject to our agreements with them.
            </p>

            <h3 className='text-[21px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mt-6 mb-4'>
              Hour Block Knowledge Base
            </h3>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              Our Knowledge Base employs cookies and browser storage technologies to help customers
              analyze visitor usage. Examples include:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>
                <strong>Cookie:</strong> _ga – Distinguishes one visitor from another when customers
                integrate Google Analytics (13&nbsp;months, served by Google).
              </li>
              <li>
                <strong>Cookie:</strong> _ga_&lt;id&gt; – Identifies and tracks an individual
                session (13&nbsp;months, served by Google).
              </li>
              <li>
                <strong>Local storage:</strong> _hourblock_kb_visitor_id – Establishes unique
                visitor IDs for Knowledge Base Analytics (perpetual, served by Hour Block).
              </li>
              <li>
                <strong>Cookie:</strong> hourblock-customer-portal-session-cookie – Set when a
                visitor verifies their email to access past conversations (4&nbsp;days, served by
                Hour Block).
              </li>
            </ul>

            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059] mt-4'>
              Customers can integrate third-party services (for example, embedded YouTube or Vimeo
              videos) into their Knowledge Base which may place additional cookies. Visitors can
              reject or clear cookies in their browser settings, though some features may not
              function if cookies are disabled.
            </p>

            <h3 className='text-[21px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mt-6 mb-4'>
              Hour Block Chat
            </h3>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              Our Chat product uses the following cookies:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>
                <strong>Cookie:</strong> fccid – Distinguishes chat visitors; produces analytics
                metrics (7&nbsp;days, Hour Block).
              </li>
              <li>
                <strong>Cookie:</strong> fcaid – Distinguishes unique conversations; produces
                analytics metrics (7&nbsp;days, Hour Block).
              </li>
              <li>
                <strong>Cookie:</strong> fcuid – Associates a visitor and their conversations with a
                specific Hour Block application (7&nbsp;days, Hour Block).
              </li>
              <li>
                <strong>Cookie:</strong> hourblockChatChannelToken – Authenticates visitors and
                restricts access to their conversations (7&nbsp;days, Hour Block).
              </li>
            </ul>

            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059] mt-4'>
              Most browsers allow chat visitors to reject or clear cookies, but certain features may
              not function without them.
            </p>

            <h3 className='text-[21px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mt-6 mb-4'>
              Changes
            </h3>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              The technologies we use may change from time to time and this section is subject to
              change at any time. We encourage visitors and customers to review it periodically.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              15. Google User Data Privacy Notice
            </h2>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              Certain features of the Service (for example, Omnichannel Inbox, Collaboration, and
              Workflow Automation) require access to Google Workspace APIs such as Gmail and
              Calendar. Information obtained from these APIs (&quot;Google User Data&quot;) is
              Customer Data that we process on behalf of our customers and is restricted by
              Google&rsquo;s API Terms of Service and Google User Data Policy (the &quot;Google
              Requirements&quot;).
            </p>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059] mt-4'>
              We access, use, store, and share Google User Data only as necessary to provide and
              improve the relevant features, and never to develop, improve, or train generalized AI
              or ML models. We do not sell Google User Data. We share Google User Data only with:
            </p>
            <ul className='list-disc pl-6 mt-4 space-y-2 text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059]'>
              <li>Service providers that help us deliver the Service;</li>
              <li>As required for security purposes (e.g., investigating abuse);</li>
              <li>To comply with applicable laws;</li>
              <li>
                As part of a merger, acquisition, or sale of assets, after obtaining explicit prior
                consent from the user.
              </li>
            </ul>
            <p className='text-[17px] text-[#86868b] font-[400] tracking-[-0.022em] leading-[1.47059] mt-4'>
              We use technical, organizational, and physical safeguards designed to protect Google
              User Data and we retain and delete it in accordance with customer instructions and the
              Google Requirements.
            </p>
          </section>

          <section>
            <h2 className='text-[28px] font-[600] tracking-[-0.015em] text-[#f5f5f7] mb-6'>
              16. Contact Us
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
