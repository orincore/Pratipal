import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer | Pratipal",
  description: "Read the Disclaimer for Pratipal.in regarding the use of information on our website.",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-xs text-emerald-600 hover:text-emerald-800 transition">← Back to Home</Link>
          <h1 className="mt-4 text-4xl font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Disclaimer
          </h1>
          <p className="mt-2 text-sm text-stone-500">Last updated: March 25, 2026</p>
        </div>

        <div className="space-y-8 text-stone-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Interpretation and Definitions</h2>
            <h3 className="text-base font-semibold text-stone-800 mb-2">Interpretation</h3>
            <p>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
            <h3 className="text-base font-semibold text-stone-800 mt-4 mb-2">Definitions</h3>
            <p className="mb-3">For the purposes of this Disclaimer:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Disclaimer) refers to Pratipal.</li>
              <li><strong>Service</strong> refers to the Website.</li>
              <li><strong>You</strong> means the individual accessing the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
              <li><strong>Website</strong> refers to Pratipal, accessible from <a href="https://www.pratipal.in/" className="text-emerald-700 underline">https://www.pratipal.in/</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Disclaimer</h2>
            <p className="mb-3">The information contained on the Service is for general information purposes only.</p>
            <p className="mb-3">The Company assumes no responsibility for errors or omissions in the contents of the Service.</p>
            <p className="mb-3">In no event shall the Company be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in connection with the use of the Service or the contents of the Service. The Company reserves the right to make additions, deletions, or modifications to the contents on the Service at any time without prior notice.</p>
            <p>The Company does not warrant that the Service is free of viruses or other harmful components.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>External Links Disclaimer</h2>
            <p className="mb-3">The Service may contain links to external websites that are not provided or maintained by or in any way affiliated with the Company.</p>
            <p>Please note that the Company does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Errors and Omissions Disclaimer</h2>
            <p className="mb-3">The information given by the Service is for general guidance on matters of interest only. Even if the Company takes every precaution to ensure that the content of the Service is both current and accurate, errors can occur. Plus, given the changing nature of laws, rules and regulations, there may be delays, omissions or inaccuracies in the information contained on the Service.</p>
            <p>The Company is not responsible for any errors or omissions, or for the results obtained from the use of this information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Fair Use Disclaimer</h2>
            <p className="mb-3">The Company may use copyrighted material which has not always been specifically authorized by the copyright owner. The Company is making such material available for criticism, comment, news reporting, teaching, scholarship, or research.</p>
            <p className="mb-3">The Company believes this constitutes a "fair use" of any such copyrighted material as provided for in section 107 of the United States Copyright law (or equivalent provisions under applicable law).</p>
            <p>If You wish to use copyrighted material from the Service for your own purposes that go beyond fair use, You must obtain permission from the copyright owner.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Views Expressed Disclaimer</h2>
            <p className="mb-3">The Service may contain views and opinions which are those of the authors and do not necessarily reflect the official policy or position of any other author, agency, organization, employer or company, including the Company.</p>
            <p>If the Service allows users to post content (including comments), such content is the sole responsibility of the user who posted it. The Company is not liable for user-generated content and reserves the right to remove it for any reason.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>No Responsibility Disclaimer</h2>
            <p className="mb-3">The information on the Service is provided with the understanding that the Company is not herein engaged in rendering legal, accounting, tax, or other professional advice and services. As such, it should not be used as a substitute for consultation with professional accounting, tax, legal or other competent advisers.</p>
            <p>In no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever arising out of or in connection with your access or use or inability to access or use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>"Use at Your Own Risk" Disclaimer</h2>
            <p className="mb-3">All information in the Service is provided "as is", with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information, and without warranty of any kind, express or implied, including, but not limited to warranties of performance, merchantability and fitness for a particular purpose.</p>
            <p>The Company will not be liable to You or anyone else for any decision made or action taken in reliance on the information given by the Service or for any consequential, special or similar damages, even if advised of the possibility of such damages.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Contact Us</h2>
            <p className="mb-2">If you have any questions about this Disclaimer, You can contact Us:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>By email: <a href="mailto:connect@pratipal.in" className="text-emerald-700 underline">connect@pratipal.in</a></li>
              <li>By visiting this page on our website: <a href="https://www.pratipal.in/" className="text-emerald-700 underline">https://www.pratipal.in/</a></li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
