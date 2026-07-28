import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200/80">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: July 28, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing or using BusDesk, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not access or use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">2. Service Description</h2>
            <p>
              BusDesk provides AI-powered receptionist, customer inquiry response, and messaging management services integrated with Meta’s WhatsApp Business Cloud API.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">3. User Responsibilities</h2>
            <p>
              Users must comply with all applicable local laws, regulations, and Meta’s WhatsApp Commerce Policy. Spam, unauthorized broadcasts, or abusive messaging practices are strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">4. Limitation of Liability</h2>
            <p>
              BusDesk is provided on an "as is" and "as available" basis. We are not liable for indirect, incidental, or consequential damages resulting from platform downtime or third-party API service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">5. Contact Information</h2>
            <p>
              For inquiries regarding these Terms, please contact <a href="mailto:support@busdesk.in" className="text-indigo-600 font-medium underline">support@busdesk.in</a>.
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
