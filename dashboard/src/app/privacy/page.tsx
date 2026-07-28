import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200/80">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: July 28, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">1. Information We Collect</h2>
            <p>
              BusDesk collects necessary account and business information (such as business name, email address, and phone numbers) to provide our AI Receptionist and WhatsApp messaging management services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">2. How We Use Information</h2>
            <p>
              We use customer information exclusively to deliver real-time AI automated responses, process messaging webhooks via Meta WhatsApp Cloud API, and allow business owners to view and manage customer conversations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">3. Data Security & Storage</h2>
            <p>
              All customer data is encrypted in-transit (HTTPS/TLS) and at-rest (AES-256). We enforce strict row-level security so each business operates in an isolated tenant environment. We do not sell, rent, or share personal data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">4. Meta WhatsApp API Data Policy</h2>
            <p>
              BusDesk complies with Meta’s Developer Data Use Policy. WhatsApp messaging data is processed solely for providing automated business response services requested by the business owner.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">5. Contact Us</h2>
            <p>
              If you have questions regarding this Privacy Policy, please contact us at <a href="mailto:support@busdesk.in" className="text-indigo-600 font-medium underline">support@busdesk.in</a>.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <p>© 2026 BusDesk. All rights reserved.</p>
          <Link href="/" className="text-indigo-600 font-semibold hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
