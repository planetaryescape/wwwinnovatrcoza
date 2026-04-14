import { useEffect } from "react";
import { Mail, ExternalLink, Shield } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import { InnovatrFooter } from "@/components/InnovatrFooter";
import { useSEO } from "@/hooks/use-seo";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
  dark: "#0D0B1F",
  offWhite: "#F8F7F4",
};

const sections = [
  {
    num: "01",
    title: "Introduction",
    content: (
      <>
        <p>
          Innovatr (Pty) Ltd (<strong>"Innovatr"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong>) operates the website{" "}
          <a href="https://www.innovatr.co.za" style={{ color: BRAND.coral, textDecoration: "underline" }}>
            www.innovatr.co.za
          </a>{" "}
          and associated digital platforms.
        </p>
        <p style={{ marginTop: 12 }}>
          This Privacy Policy explains how we collect, use, store, and protect your personal information. It applies to all individuals who interact with our website, fill in lead generation forms, or engage with our marketing and research services.
        </p>
        <p style={{ marginTop: 12 }}>
          We are committed to protecting your privacy and handling your personal information responsibly in accordance with the{" "}
          <strong>Protection of Personal Information Act, 4 of 2013 (POPIA)</strong> — South Africa's data protection legislation.
        </p>
        <p style={{ marginTop: 12 }}>
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
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            ["Full name", "To identify and address you appropriately"],
            ["Business email address", "To communicate with you about our services"],
            ["Company name", "To understand the organisation you represent"],
            ["Job title / role", "To tailor our communications to your seniority and function"],
            ["Phone number (where provided)", "To follow up on demo requests"],
            ["Message content", "When submitted through our contact or enquiry forms"],
          ].map(([label, desc]) => (
            <li key={label as string} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.coral, display: "inline-block" }} />
              <span><strong>{label}</strong> — {desc}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
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
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            "Scheduling and confirming product demos or introductory calls",
            "Sending relevant communications about Innovatr's services, research products, and membership offerings",
            "Responding to enquiries and requests you have made",
            "Improving our website, service offerings, and marketing effectiveness",
            "Managing our client and prospect relationship records",
            "Complying with applicable legal obligations",
          ].map((item) => (
            <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.violet, display: "inline-block" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
          We will not use your information for any purpose that is incompatible with the reason it was provided. You may opt out of marketing communications at any time by contacting us at{" "}
          <a href="mailto:richard@innovatr.co.za" style={{ color: BRAND.coral, textDecoration: "underline" }}>richard@innovatr.co.za</a>.
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
        <p style={{ marginTop: 12 }}>
          We do not sell, share, or repurpose LinkedIn-sourced lead data for any other commercial purpose. LinkedIn's own privacy policy also applies to data collected on their platform. You can review it at{" "}
          <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: BRAND.coral, textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}>
            linkedin.com/legal/privacy-policy <ExternalLink style={{ width: 13, height: 13 }} />
          </a>.
        </p>
        <p style={{ marginTop: 12 }}>
          If you submitted a form but no longer wish to be contacted, please email us at{" "}
          <a href="mailto:richard@innovatr.co.za" style={{ color: BRAND.coral, textDecoration: "underline" }}>richard@innovatr.co.za</a>{" "}
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
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            "Data is stored on secure cloud infrastructure with access controls and encryption at rest",
            "Access to personal data is restricted to authorised Innovatr personnel only",
            "We regularly review our security practices to align with industry best practice",
            "Data is retained only for as long as necessary to fulfil the purpose for which it was collected, or as required by law",
          ].map((item) => (
            <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.dark, display: "inline-block" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
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
        <p>We use a limited number of trusted third-party tools to operate our business effectively. These may process your personal information on our behalf:</p>
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            ["LinkedIn", "We use LinkedIn for advertising and lead generation. Data submitted via LinkedIn Lead Gen forms is transferred to Innovatr and processed as described in Section 04."],
            ["CRM & Communication Tools", "We use CRM and email communication platforms to manage our contact database and send relevant communications. These platforms are bound by contractual obligations to protect your data."],
            ["Analytics", "We may use website analytics tools (such as Google Analytics) to understand how visitors use our website. This data is aggregated and does not personally identify you."],
          ].map(([name, desc]) => (
            <li key={name as string} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.coral, display: "inline-block" }} />
              <span><strong>{name}</strong> — {desc}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
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
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            ["Right of Access", "You may request a copy of the personal information we hold about you"],
            ["Right to Correction", "You may request that we correct or update any inaccurate or incomplete information"],
            ["Right to Deletion", "You may request that we delete your personal information, subject to certain legal retention requirements"],
            ["Right to Object", "You may object to the processing of your personal information for direct marketing purposes"],
            ["Right to Withdraw Consent", "Where processing is based on your consent, you may withdraw that consent at any time"],
          ].map(([right, desc]) => (
            <li key={right as string} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.violet, display: "inline-block" }} />
              <span><strong>{right}</strong> — {desc}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
          To exercise any of these rights, please contact our Information Officer at{" "}
          <a href="mailto:richard@innovatr.co.za" style={{ color: BRAND.coral, textDecoration: "underline" }}>richard@innovatr.co.za</a>. We will respond within a reasonable time and in accordance with POPIA requirements.
        </p>
        <p style={{ marginTop: 12 }}>If you believe your rights have been infringed, you may lodge a complaint with the <strong>Information Regulator of South Africa</strong>:</p>
        <div style={{ marginTop: 10, paddingLeft: 16, borderLeft: `2px solid ${BRAND.violet}40` }}>
          <p style={{ fontSize: 14 }}>
            Information Regulator (South Africa)<br />
            <a href="https://www.inforegulator.org.za" target="_blank" rel="noopener noreferrer" style={{ color: BRAND.coral, textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}>
              www.inforegulator.org.za <ExternalLink style={{ width: 12, height: 12 }} />
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
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            ["Essential cookies", "Required for the website to function correctly. These cannot be disabled."],
            ["Analytics cookies", "Help us understand how visitors interact with our website so we can improve it. Data is aggregated and anonymised."],
            ["Marketing cookies", "Used to track the effectiveness of our advertising campaigns (e.g. LinkedIn Insight Tag, Google Tag Manager)."],
          ].map(([name, desc]) => (
            <li key={name as string} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.dark, display: "inline-block" }} />
              <span><strong>{name}</strong> — {desc}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
          For a full breakdown of the cookies we use and how to manage them, please see our{" "}
          <a href="/cookie-policy" style={{ color: BRAND.coral, textDecoration: "underline" }}>Cookie Policy</a>.
          You can control or disable cookies through your browser settings at any time.
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
        <div style={{ marginTop: 16, padding: 20, borderRadius: 10, background: `${BRAND.violet}08`, border: `1px solid ${BRAND.violet}18` }}>
          <p style={{ fontWeight: 600, color: BRAND.dark }}>Innovatr (Pty) Ltd</p>
          <p style={{ marginTop: 6, color: `${BRAND.dark}bb` }}>Information Officer: Richard</p>
          <p style={{ marginTop: 6 }}>
            <a href="mailto:richard@innovatr.co.za" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: BRAND.coral, textDecoration: "underline", fontWeight: 500 }}>
              <Mail style={{ width: 15, height: 15 }} />
              richard@innovatr.co.za
            </a>
          </p>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: `${BRAND.dark}88` }}>
          We aim to respond to all privacy-related enquiries within <strong>10 business days</strong>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  useSEO({
    title: "Privacy Policy",
    description: "Innovatr's privacy policy. Learn how we collect, use, and protect your personal information when you use our research and consulting services.",
    canonicalUrl: "https://www.innovatr.co.za/privacy-policy",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', backgroundColor: BRAND.offWhite, color: BRAND.dark, minHeight: "100vh" }}>
      <PublicNavbar />
      <main>
      {/* Hero */}
      <section aria-label="Page heading" style={{ background: BRAND.dark, padding: "100px 32px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, right: -80, width: 400, height: 400, background: `radial-gradient(ellipse, ${BRAND.violet}22 0%, transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: "15%", width: 300, height: 300, background: `radial-gradient(ellipse, ${BRAND.coral}12 0%, transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${BRAND.coral}18`, border: `1px solid ${BRAND.coral}40`, borderRadius: 100, padding: "6px 14px", marginBottom: 24 }}>
            <Shield style={{ width: 13, height: 13, color: BRAND.coral }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.coral, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>POPIA Compliant</span>
          </div>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 400, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>Last updated: March 2026</p>
        </div>
      </section>

      {/* Quick nav */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BRAND.dark}0D`, padding: "12px 32px", overflowX: "auto" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 20, flexWrap: "nowrap" as const }}>
          {sections.map((s) => (
            <a key={s.num} href={`#section-${s.num}`} style={{ flexShrink: 0, fontSize: 12, fontWeight: 500, color: `${BRAND.dark}66`, textDecoration: "none", whiteSpace: "nowrap" as const, transition: "color 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget).style.color = BRAND.violet; }}
              onMouseLeave={(e) => { (e.currentTarget).style.color = `${BRAND.dark}66`; }}
            >
              {s.num}. {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding: "48px 32px 80px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {sections.map((section, idx) => (
            <div key={section.num}>
              <article id={`section-${section.num}`} style={{ padding: "40px 0", scrollMarginTop: 80 }}>
                <div style={{ display: "flex", gap: 24 }}>
                  <div style={{ flexShrink: 0, width: 3, borderRadius: 99, background: BRAND.coral, alignSelf: "stretch", minHeight: "100%" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: BRAND.coral }}>{section.num}</span>
                      <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", fontWeight: 400, color: BRAND.dark, margin: 0, letterSpacing: "-0.01em" }}>
                        {section.title}
                      </h2>
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.78, color: `${BRAND.dark}cc` }}>
                      {section.content}
                    </div>
                  </div>
                </div>
              </article>
              {idx < sections.length - 1 && <hr style={{ border: "none", borderTop: `1px solid ${BRAND.dark}0D`, margin: 0 }} />}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ maxWidth: 800, margin: "56px auto 0", textAlign: "center" }}>
          <div style={{ display: "inline-block", padding: "36px 48px", borderRadius: 12, background: "#fff", border: `1px solid ${BRAND.dark}0D` }}>
            <p style={{ fontSize: 13, color: `${BRAND.dark}77`, margin: "0 0 6px" }}>Questions about your personal data?</p>
            <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: "clamp(1rem, 2vw, 1.3rem)", color: BRAND.dark, margin: "0 0 20px", fontWeight: 400 }}>
              Get in touch with our Information Officer
            </h3>
            <a href="mailto:richard@innovatr.co.za"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 8, background: BRAND.coral, color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
              data-testid="button-contact-privacy"
            >
              <Mail style={{ width: 15, height: 15 }} />
              richard@innovatr.co.za
            </a>
          </div>
        </div>
      </div>
      </main>
      <InnovatrFooter />
    </div>
  );
}
