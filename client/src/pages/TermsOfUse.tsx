import { useEffect } from "react";
import { useSEO } from "@/hooks/use-seo";
import { Mail, FileText } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import { InnovatrFooter } from "@/components/InnovatrFooter";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
  dark: "#0D0B1F",
  offWhite: "#F8F7F4",
};

const sections = [
  {
    num: "01",
    title: "Acceptance of Terms",
    content: (
      <>
        <p>
          By accessing or using the Innovatr website at <a href="https://www.innovatr.co.za" style={{ color: BRAND.coral, textDecoration: "underline" }}>www.innovatr.co.za</a> (the <strong>"Site"</strong>) or any services provided by Innovatr (Pty) Ltd (<strong>"Innovatr"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong>), you agree to be bound by these Terms of Use (<strong>"Terms"</strong>).
        </p>
        <p style={{ marginTop: 12 }}>
          If you do not agree with any part of these Terms, you must not use the Site or our services. These Terms apply to all visitors, users, and anyone who accesses or uses the Site.
        </p>
        <p style={{ marginTop: 12 }}>
          We reserve the right to update these Terms at any time. Continued use of the Site following any changes constitutes your acceptance of the revised Terms. We will indicate the date of the most recent update at the top of this page.
        </p>
      </>
    ),
  },
  {
    num: "02",
    title: "Description of Services",
    content: (
      <>
        <p>
          Innovatr provides AI-powered market research and consumer intelligence services to businesses and individuals. Our services include, but are not limited to:
        </p>
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            "Test24 — rapid consumer research delivered within 24 hours",
            "Innovatr Intelligence — subscription-based industry trend reports and insights",
            "Consult — bespoke strategy, design, and research consulting services",
            "Research Tools — access to a proprietary suite of insight and analysis tools",
            "Case Studies and published research findings available through the Site",
          ].map((item) => (
            <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.coral, display: "inline-block" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
          We reserve the right to modify, suspend, or discontinue any service at any time with or without notice. Innovatr shall not be liable to you or any third party for any such modification, suspension, or discontinuation.
        </p>
      </>
    ),
  },
  {
    num: "03",
    title: "Eligibility & Account Registration",
    content: (
      <>
        <p>
          You must be at least 18 years old and capable of entering into a legally binding agreement to use our services. By registering for an account or purchasing a service, you represent that you meet these requirements.
        </p>
        <p style={{ marginTop: 12 }}>
          When you create an account, you agree to:
        </p>
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            "Provide accurate, current, and complete information",
            "Maintain and promptly update your account information to keep it accurate",
            "Maintain the confidentiality of your login credentials",
            "Accept responsibility for all activity that occurs under your account",
            "Notify us immediately if you suspect any unauthorised use of your account",
          ].map((item) => (
            <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.violet, display: "inline-block" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
          Innovatr reserves the right to suspend or terminate accounts that contain false information or that are used in breach of these Terms.
        </p>
      </>
    ),
  },
  {
    num: "04",
    title: "Acceptable Use",
    content: (
      <>
        <p>You agree to use the Site and our services only for lawful purposes and in accordance with these Terms. You must not:</p>
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            "Use the Site in any way that violates any applicable local, national, or international law or regulation",
            "Transmit any unsolicited or unauthorised advertising or promotional material (spam)",
            "Attempt to gain unauthorised access to any part of the Site, server, or database",
            "Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Site",
            "Use automated tools, bots, or scrapers to extract data from the Site without our written consent",
            "Upload or transmit viruses, malware, or any other harmful code",
            "Impersonate any person or entity, or falsely state your affiliation with any person or entity",
            "Reproduce, duplicate, copy, or re-sell any part of our services in breach of these Terms",
          ].map((item) => (
            <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.coral, display: "inline-block" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
          Violation of these provisions may result in immediate termination of your access to our services and may be reported to relevant law enforcement authorities.
        </p>
      </>
    ),
  },
  {
    num: "05",
    title: "Intellectual Property",
    content: (
      <>
        <p>
          All content on this Site — including but not limited to text, graphics, logos, icons, images, reports, data visualisations, and software — is the property of Innovatr (Pty) Ltd or its content suppliers and is protected by applicable intellectual property laws.
        </p>
        <p style={{ marginTop: 12 }}>
          You are granted a limited, non-exclusive, non-transferable licence to access and use the Site and its content for your internal business purposes only. This licence does not include:
        </p>
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            "Reselling or commercially exploiting the Site or its content",
            "Downloading or copying account information for the benefit of another party",
            "Using data mining, scraping, or similar data-gathering methods",
            "Reproducing, duplicating, copying, or publicly displaying our reports or research materials without written permission",
          ].map((item) => (
            <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.dark, display: "inline-block" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
          Any unauthorised use terminates the licence granted by Innovatr. All rights not expressly granted are reserved.
        </p>
      </>
    ),
  },
  {
    num: "06",
    title: "Payment & Subscription Terms",
    content: (
      <>
        <p>
          Certain services offered by Innovatr require payment, including Test24 research studies and Innovatr Intelligence memberships. By purchasing a service, you agree to pay all applicable fees as quoted at the time of purchase.
        </p>
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            ["Payment processing", "All payments are processed securely via our third-party payment gateway. Innovatr does not store your card details."],
            ["Subscriptions", "Membership subscriptions are billed on a recurring basis (monthly or annually) until cancelled. You may cancel at any time from your account settings."],
            ["Refunds", "Research studies that have been commissioned and deployed are non-refundable once fieldwork has commenced. Unused credits may be refunded at our discretion — contact us to discuss."],
            ["Pricing changes", "We reserve the right to change our pricing at any time. Existing subscribers will be notified at least 30 days before any price change takes effect."],
          ].map(([title, desc]) => (
            <li key={title as string} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.violet, display: "inline-block" }} />
              <span><strong>{title}</strong> — {desc}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
          All prices are quoted in South African Rand (ZAR) unless otherwise stated, and exclude VAT where applicable.
        </p>
      </>
    ),
  },
  {
    num: "07",
    title: "Disclaimers",
    content: (
      <>
        <p>
          The Site and all services are provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
        </p>
        <p style={{ marginTop: 12 }}>
          Innovatr does not warrant that:
        </p>
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            "The Site will be available at all times, uninterrupted, or error-free",
            "Research results or insights are guaranteed to produce specific business outcomes",
            "The Site is free of viruses or other harmful components",
            "Any information on the Site is accurate, complete, or current",
          ].map((item) => (
            <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.coral, display: "inline-block" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
          Research insights and reports represent the findings of consumer studies and are provided for informational purposes. They do not constitute legal, financial, or professional advice.
        </p>
      </>
    ),
  },
  {
    num: "08",
    title: "Limitation of Liability",
    content: (
      <>
        <p>
          To the fullest extent permitted by applicable law, Innovatr (Pty) Ltd, its directors, employees, partners, agents, suppliers, or affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, goodwill, or business opportunities — arising from:
        </p>
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            "Your use of or inability to use the Site or our services",
            "Any unauthorised access to or alteration of your data",
            "Any content or conduct of any third party on the Site",
            "Business decisions made based on research results or insights provided by Innovatr",
          ].map((item) => (
            <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.dark, display: "inline-block" }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
          In no event shall our total liability to you for all claims arising from or relating to the use of our services exceed the amount you paid to Innovatr in the 12 months preceding the claim.
        </p>
      </>
    ),
  },
  {
    num: "09",
    title: "Governing Law & Jurisdiction",
    content: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the <strong>Republic of South Africa</strong>, without regard to its conflict of law provisions.
        </p>
        <p style={{ marginTop: 12 }}>
          Any dispute arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in <strong>Cape Town, Western Cape, South Africa</strong>, and you hereby consent to the personal jurisdiction of those courts.
        </p>
        <p style={{ marginTop: 12 }}>
          Where possible, we prefer to resolve disputes informally. If you have a concern, please contact us at <a href="mailto:richard@innovatr.co.za" style={{ color: BRAND.coral, textDecoration: "underline" }}>richard@innovatr.co.za</a> and we will endeavour to reach a fair resolution.
        </p>
      </>
    ),
  },
  {
    num: "10",
    title: "Contact Us",
    content: (
      <>
        <p>If you have any questions about these Terms of Use, please contact us:</p>
        <div style={{ marginTop: 16, padding: 20, borderRadius: 10, background: `${BRAND.violet}08`, border: `1px solid ${BRAND.violet}18` }}>
          <p style={{ fontWeight: 600, color: BRAND.dark }}>Innovatr (Pty) Ltd</p>
          <p style={{ marginTop: 6, color: `${BRAND.dark}bb` }}>Cape Town, South Africa</p>
          <p style={{ marginTop: 6 }}>
            <a href="mailto:richard@innovatr.co.za" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: BRAND.coral, textDecoration: "underline", fontWeight: 500 }}>
              <Mail style={{ width: 15, height: 15 }} />
              richard@innovatr.co.za
            </a>
          </p>
        </div>
      </>
    ),
  },
];

export default function TermsOfUse() {
  useSEO({
    title: "Terms of Use",
    description: "Innovatr's terms of use. Read the terms and conditions that govern your use of our research platform, tools, and consulting services.",
    canonicalUrl: "https://www.innovatr.co.za/terms-of-use",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', backgroundColor: BRAND.offWhite, color: BRAND.dark, minHeight: "100vh" }}>
      <PublicNavbar />

      {/* Hero */}
      <section style={{ background: BRAND.dark, padding: "100px 32px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, right: -80, width: 400, height: 400, background: `radial-gradient(ellipse, ${BRAND.violet}22 0%, transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: "15%", width: 300, height: 300, background: `radial-gradient(ellipse, ${BRAND.coral}12 0%, transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${BRAND.violet}25`, border: `1px solid ${BRAND.violet}50`, borderRadius: 100, padding: "6px 14px", marginBottom: 24 }}>
            <FileText style={{ width: 13, height: 13, color: "#a099ff" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#a099ff", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Legal</span>
          </div>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 400, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Terms of Use
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>Last updated: April 2026</p>
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
      <main style={{ padding: "48px 32px 80px" }}>
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
            <p style={{ fontSize: 13, color: `${BRAND.dark}77`, margin: "0 0 6px" }}>Have a question about these terms?</p>
            <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: "clamp(1rem, 2vw, 1.3rem)", color: BRAND.dark, margin: "0 0 20px", fontWeight: 400 }}>
              We're happy to clarify anything
            </h3>
            <a href="mailto:richard@innovatr.co.za"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 8, background: BRAND.violet, color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
            >
              <Mail style={{ width: 15, height: 15 }} />
              richard@innovatr.co.za
            </a>
          </div>
        </div>
      </main>

      <InnovatrFooter />
    </div>
  );
}
