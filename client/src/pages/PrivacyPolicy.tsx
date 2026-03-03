import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, ExternalLink, Shield } from "lucide-react";

const BRAND = {
  navy: "#2D2A6E",
  coral: "#E8533A",
  teal: "#2EC4B6",
  yellow: "#F5C842",
  bg: "#F4F6FB",
  text: "#333333",
};

const sections = [
  {
    num: "01",
    title: "Introduction",
    content: (
      <>
        <p>
          Innovatr (Pty) Ltd (<strong>"Innovatr"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong>) operates the website{" "}
          <a href="https://www.innovatr.co.za" className="underline" style={{ color: BRAND.coral }}>
            www.innovatr.co.za
          </a>{" "}
          and associated digital platforms.
        </p>
        <p className="mt-3">
          This Privacy Policy explains how we collect, use, store, and protect your personal information. It applies to all individuals who interact with our website, fill in lead generation forms, or engage with our marketing and research services.
        </p>
        <p className="mt-3">
          We are committed to protecting your privacy and handling your personal information responsibly in accordance with the{" "}
          <strong>Protection of Personal Information Act, 4 of 2013 (POPIA)</strong> — South Africa's data protection legislation.
        </p>
        <p className="mt-3">
          By using our website or submitting your information through any of our forms, you acknowledge that you have read and understood this policy.
        </p>
      </>
    ),
  },
  {
    num: "02",
    title: "Information We Collect",
    content: (
      <>
        <p>We collect the following categories of personal information:</p>
        <ul className="mt-3 space-y-2 pl-4">
          {[
            ["Full name", "To identify and address you appropriately"],
            ["Business email address", "To communicate with you about our services"],
            ["Company name", "To understand the organisation you represent"],
            ["Job title / role", "To tailor our communications to your seniority and function"],
            ["Phone number (where provided)", "To follow up on demo requests"],
            ["Message content", "When submitted through our contact or enquiry forms"],
          ].map(([label, desc]) => (
            <li key={label} className="flex gap-2">
              <span className="mt-1 shrink-0 w-2 h-2 rounded-full inline-block" style={{ backgroundColor: BRAND.coral }} />
              <span>
                <strong>{label}</strong> — {desc}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          This information is collected when you complete a form on our website, respond to a LinkedIn Lead Generation advertisement, request a product demo, or contact us directly.
        </p>
      </>
    ),
  },
  {
    num: "03",
    title: "How We Use Your Information",
    content: (
      <>
        <p>We use your personal information only for the purposes for which it was collected, or purposes that are compatible with the original collection purpose. These include:</p>
        <ul className="mt-3 space-y-2 pl-4">
          {[
            "Scheduling and confirming product demos or introductory calls",
            "Sending relevant communications about Innovatr's services, research products, and membership offerings",
            "Responding to enquiries and requests you have made",
            "Improving our website, service offerings, and marketing effectiveness",
            "Managing our client and prospect relationship records",
            "Complying with applicable legal obligations",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 shrink-0 w-2 h-2 rounded-full inline-block" style={{ backgroundColor: BRAND.teal }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          We will not use your information for any purpose that is incompatible with the reason it was provided. You may opt out of marketing communications at any time by contacting us at{" "}
          <a href="mailto:richard@innovatr.co.za" className="underline" style={{ color: BRAND.coral }}>
            richard@innovatr.co.za
          </a>.
        </p>
      </>
    ),
  },
  {
    num: "04",
    title: "LinkedIn Lead Generation Forms",
    content: (
      <>
        <p>
          We run paid advertising campaigns on LinkedIn that include Lead Generation forms. When you submit your details through a LinkedIn Lead Gen form, that information is transferred to Innovatr and used <strong>solely for the purpose of following up on your interest</strong> — typically to book a demo, provide requested information, or add you to relevant communications.
        </p>
        <p className="mt-3">
          We do not sell, share, or repurpose LinkedIn-sourced lead data for any other commercial purpose. LinkedIn's own privacy policy also applies to data collected on their platform. You can review it at{" "}
          <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1" style={{ color: BRAND.coral }}>
            linkedin.com/legal/privacy-policy
            <ExternalLink className="w-3.5 h-3.5" />
          </a>.
        </p>
        <p className="mt-3">
          If you submitted a form but no longer wish to be contacted, please email us at{" "}
          <a href="mailto:richard@innovatr.co.za" className="underline" style={{ color: BRAND.coral }}>
            richard@innovatr.co.za
          </a>{" "}
          and we will remove your details from our records promptly.
        </p>
      </>
    ),
  },
  {
    num: "05",
    title: "Data Storage & Security",
    content: (
      <>
        <p>
          Your personal information is stored securely using industry-standard technical and organisational safeguards. We take reasonable and appropriate measures to protect your data against unauthorised access, disclosure, alteration, or destruction.
        </p>
        <ul className="mt-3 space-y-2 pl-4">
          {[
            "Data is stored on secure cloud infrastructure with access controls and encryption at rest",
            "Access to personal data is restricted to authorised Innovatr personnel only",
            "We regularly review our security practices to align with industry best practice",
            "Data is retained only for as long as necessary to fulfil the purpose for which it was collected, or as required by law",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 shrink-0 w-2 h-2 rounded-full inline-block" style={{ backgroundColor: BRAND.navy }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          In the event of a data breach that poses a risk to your rights and freedoms, we will notify the Information Regulator and affected individuals in accordance with the requirements of POPIA.
        </p>
      </>
    ),
  },
  {
    num: "06",
    title: "Third-Party Services",
    content: (
      <>
        <p>
          We use a limited number of trusted third-party tools to operate our business effectively. These may process your personal information on our behalf:
        </p>
        <ul className="mt-3 space-y-2 pl-4">
          {[
            [
              "LinkedIn",
              "We use LinkedIn for advertising and lead generation. Data submitted via LinkedIn Lead Gen forms is transferred to Innovatr and processed as described in Section 04.",
            ],
            [
              "CRM & Communication Tools",
              "We use CRM and email communication platforms to manage our contact database and send relevant communications. These platforms are bound by contractual obligations to protect your data.",
            ],
            [
              "Analytics",
              "We may use website analytics tools (such as Google Analytics) to understand how visitors use our website. This data is aggregated and does not personally identify you.",
            ],
          ].map(([name, desc]) => (
            <li key={name as string} className="flex gap-2">
              <span className="mt-1 shrink-0 w-2 h-2 rounded-full inline-block" style={{ backgroundColor: BRAND.coral }} />
              <span>
                <strong>{name}</strong> — {desc}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          We do not sell your personal information to any third party, and we do not allow third-party services to use your data for their own marketing purposes.
        </p>
      </>
    ),
  },
  {
    num: "07",
    title: "Your Rights Under POPIA",
    content: (
      <>
        <p>
          As a data subject under the <strong>Protection of Personal Information Act (POPIA)</strong>, you have the following rights regarding your personal information held by Innovatr:
        </p>
        <ul className="mt-3 space-y-2 pl-4">
          {[
            ["Right of Access", "You may request a copy of the personal information we hold about you"],
            ["Right to Correction", "You may request that we correct or update any inaccurate or incomplete information"],
            ["Right to Deletion", "You may request that we delete your personal information, subject to certain legal retention requirements"],
            ["Right to Object", "You may object to the processing of your personal information for direct marketing purposes"],
            ["Right to Withdraw Consent", "Where processing is based on your consent, you may withdraw that consent at any time"],
          ].map(([right, desc]) => (
            <li key={right as string} className="flex gap-2">
              <span className="mt-1 shrink-0 w-2 h-2 rounded-full inline-block" style={{ backgroundColor: BRAND.teal }} />
              <span>
                <strong>{right}</strong> — {desc}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          To exercise any of these rights, please contact our Information Officer at{" "}
          <a href="mailto:richard@innovatr.co.za" className="underline" style={{ color: BRAND.coral }}>
            richard@innovatr.co.za
          </a>. We will respond to your request within a reasonable time and in accordance with POPIA requirements.
        </p>
        <p className="mt-3">
          If you believe your rights have been infringed, you may lodge a complaint with the{" "}
          <strong>Information Regulator of South Africa</strong>:
        </p>
        <div className="mt-2 pl-4 border-l-2" style={{ borderColor: BRAND.navy }}>
          <p className="text-sm">
            Information Regulator (South Africa)
            <br />
            <a href="https://www.inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1" style={{ color: BRAND.coral }}>
              www.inforegulator.org.za
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </>
    ),
  },
  {
    num: "08",
    title: "Cookies",
    content: (
      <>
        <p>
          Our website uses cookies — small text files stored on your device — to improve functionality and user experience. We use the following types of cookies:
        </p>
        <ul className="mt-3 space-y-2 pl-4">
          {[
            ["Essential cookies", "Required for the website to function correctly. These cannot be disabled."],
            ["Analytics cookies", "Help us understand how visitors interact with our website so we can improve it. Data is aggregated and anonymised."],
            ["Marketing cookies", "Used to track the effectiveness of our advertising campaigns (e.g. LinkedIn Insight Tag)."],
          ].map(([name, desc]) => (
            <li key={name as string} className="flex gap-2">
              <span className="mt-1 shrink-0 w-2 h-2 rounded-full inline-block" style={{ backgroundColor: BRAND.navy }} />
              <span>
                <strong>{name}</strong> — {desc}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          You can control or disable cookies through your browser settings at any time. Note that disabling certain cookies may affect website functionality. By continuing to use our site, you consent to our use of cookies as described above.
        </p>
      </>
    ),
  },
  {
    num: "09",
    title: "Contact Us",
    content: (
      <>
        <p>
          If you have any questions, concerns, or requests relating to this Privacy Policy or the way we handle your personal information, please contact our Information Officer:
        </p>
        <div className="mt-4 p-5 rounded-lg" style={{ backgroundColor: BRAND.bg, border: `1px solid ${BRAND.navy}20` }}>
          <p className="font-semibold" style={{ color: BRAND.navy }}>Innovatr (Pty) Ltd</p>
          <p className="mt-1">Information Officer: Richard</p>
          <p className="mt-1">
            <a href="mailto:richard@innovatr.co.za" className="inline-flex items-center gap-2 font-medium underline" style={{ color: BRAND.coral }}>
              <Mail className="w-4 h-4" />
              richard@innovatr.co.za
            </a>
          </p>
          <p className="mt-1">
            <a href="https://www.innovatr.co.za" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium underline" style={{ color: BRAND.coral }}>
              <ExternalLink className="w-4 h-4" />
              www.innovatr.co.za
            </a>
          </p>
        </div>
        <p className="mt-4 text-sm" style={{ color: "#666" }}>
          We aim to respond to all privacy-related enquiries within <strong>10 business days</strong>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Privacy Policy | Innovatr";
    return () => {
      document.title = "Innovatr";
    };
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#fff", color: BRAND.text, minHeight: "100vh" }}>
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.97)",
          borderBottom: `1px solid ${BRAND.navy}15`,
          backdropFilter: "blur(8px)",
        }}
      >
        <a href="https://www.innovatr.co.za" style={{ textDecoration: "none" }}>
          <span
            className="text-xl font-bold tracking-wide"
            style={{ fontFamily: "'DM Serif Display', serif", color: BRAND.navy }}
          >
            Innovatr
          </span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href="https://www.innovatr.co.za"
            className="text-sm font-medium hidden sm:inline-flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ color: BRAND.navy, textDecoration: "none" }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            www.innovatr.co.za
          </a>
          <Link href="/">
            <span
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md transition-opacity hover:opacity-80 cursor-pointer"
              style={{ backgroundColor: BRAND.navy, color: "#fff" }}
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to App
            </span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="py-16 sm:py-24 px-6"
        style={{
          background: `linear-gradient(135deg, ${BRAND.navy} 0%, #1e1b5e 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5" style={{ color: BRAND.coral }} />
            <span className="text-sm uppercase tracking-[0.25em] font-medium" style={{ color: `${BRAND.teal}` }}>
              POPIA Compliant
            </span>
          </div>
          <h1
            className="text-white mb-4"
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              lineHeight: 1.1,
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem" }}>
            Last updated: March 2026
          </p>
          <p className="mt-4 max-w-xl mx-auto text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            This policy governs how Innovatr (Pty) Ltd collects, uses, and protects your personal information, in accordance with the Protection of Personal Information Act (POPIA).
          </p>
        </div>
      </section>

      {/* Quick Nav strip */}
      <div
        className="py-3 px-6 overflow-x-auto"
        style={{ backgroundColor: BRAND.bg, borderBottom: `1px solid ${BRAND.navy}10` }}
      >
        <div className="max-w-4xl mx-auto flex gap-4 flex-nowrap text-xs font-medium" style={{ color: BRAND.navy + "99" }}>
          {sections.map((s) => (
            <a
              key={s.num}
              href={`#section-${s.num}`}
              className="shrink-0 hover:opacity-100 transition-opacity"
              style={{ opacity: 0.6, color: BRAND.navy, textDecoration: "none" }}
            >
              {s.num}. {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <main className="py-12 sm:py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-0">
          {sections.map((section, idx) => (
            <div key={section.num}>
              <article
                id={`section-${section.num}`}
                className="py-10 sm:py-12 scroll-mt-20"
                style={{ scrollMarginTop: "80px" }}
              >
                <div className="flex gap-6">
                  {/* Left coral border accent */}
                  <div
                    className="shrink-0 w-1 rounded-full self-stretch hidden sm:block"
                    style={{ backgroundColor: BRAND.coral, minHeight: "100%" }}
                  />

                  <div className="flex-1">
                    {/* Section heading */}
                    <div className="flex items-baseline gap-3 mb-5">
                      <span
                        className="text-xs font-bold tracking-[0.2em] tabular-nums"
                        style={{ color: BRAND.coral }}
                      >
                        {section.num}
                      </span>
                      <h2
                        className="font-bold"
                        style={{
                          color: BRAND.navy,
                          fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {section.title}
                      </h2>
                    </div>

                    {/* Left coral border for mobile */}
                    <div
                      className="sm:hidden w-full pl-4 border-l-2 mb-4"
                      style={{ borderColor: BRAND.coral }}
                    />

                    {/* Body content */}
                    <div
                      className="leading-relaxed text-sm sm:text-base"
                      style={{ color: BRAND.text, lineHeight: 1.75 }}
                    >
                      {section.content}
                    </div>
                  </div>
                </div>
              </article>

              {/* Divider */}
              {idx < sections.length - 1 && (
                <hr style={{ borderColor: `${BRAND.navy}10`, margin: 0 }} />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-14 text-center">
          <div
            className="inline-block px-8 py-8 rounded-xl"
            style={{ backgroundColor: BRAND.bg, border: `1px solid ${BRAND.navy}12` }}
          >
            <p className="text-sm mb-2" style={{ color: "#666" }}>
              Questions about your personal data?
            </p>
            <h3
              className="font-bold mb-5"
              style={{ color: BRAND.navy, fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
            >
              Get in touch with our Information Officer
            </h3>
            <a
              href="mailto:richard@innovatr.co.za"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: BRAND.coral, textDecoration: "none" }}
              data-testid="button-contact-privacy"
            >
              <Mail className="w-4 h-4" />
              richard@innovatr.co.za
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-8 px-6 mt-8"
        style={{ backgroundColor: BRAND.navy }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          <p>© {new Date().getFullYear()} Innovatr (Pty) Ltd. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a
              href="https://www.innovatr.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity inline-flex items-center gap-1"
              style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              www.innovatr.co.za
            </a>
            <a
              href="mailto:richard@innovatr.co.za"
              className="hover:opacity-100 transition-opacity inline-flex items-center gap-1"
              style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
            >
              <Mail className="w-3.5 h-3.5" />
              richard@innovatr.co.za
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
