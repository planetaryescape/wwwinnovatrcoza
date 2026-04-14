import { useEffect } from "react";
import { Mail, Cookie } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import { InnovatrFooter } from "@/components/InnovatrFooter";
import { useSEO } from "@/hooks/use-seo";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
  dark: "#0D0B1F",
  offWhite: "#F8F7F4",
};

const cookieTable = [
  { name: "_ga, _gid", provider: "Google Analytics", purpose: "Distinguishes unique users and sessions, tracks pageviews and site usage", duration: "Up to 2 years" },
  { name: "GTM-*", provider: "Google Tag Manager", purpose: "Manages and fires marketing and analytics tags", duration: "Session" },
  { name: "bcookie, li_gc, UserMatchHistory", provider: "LinkedIn", purpose: "Tracks conversions and audience targeting from LinkedIn ad campaigns (Insight Tag)", duration: "Up to 1 year" },
  { name: "session_id", provider: "Innovatr", purpose: "Maintains your login session across pages", duration: "Session" },
  { name: "auth_token", provider: "Innovatr", purpose: "Keeps you logged in to your Innovatr account", duration: "30 days" },
];

const sections = [
  {
    num: "01",
    title: "What Are Cookies",
    content: (
      <>
        <p>
          Cookies are small text files that are placed on your computer, tablet, or mobile device when you visit a website. They are widely used to make websites work more efficiently, to remember your preferences, and to provide information to website operators.
        </p>
        <p style={{ marginTop: 12 }}>
          Cookies do not contain personally identifiable information on their own, but the information they collect can be linked back to you when combined with other data we hold. We handle all such data in accordance with our{" "}
          <a href="/privacy-policy" style={{ color: BRAND.coral, textDecoration: "underline" }}>Privacy Policy</a>.
        </p>
        <p style={{ marginTop: 12 }}>
          This Cookie Policy applies to all pages and services on <a href="https://www.innovatr.co.za" style={{ color: BRAND.coral, textDecoration: "underline" }}>www.innovatr.co.za</a> and the Innovatr member portal.
        </p>
      </>
    ),
  },
  {
    num: "02",
    title: "Types of Cookies We Use",
    content: (
      <>
        <p>We use the following categories of cookies on our Site:</p>
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column" as const, gap: 16 }}>
          {[
            {
              title: "Strictly Necessary Cookies",
              colour: BRAND.dark,
              desc: "These cookies are essential for the Site to function correctly. They enable core features such as page navigation, secure login to your account, and access to protected areas of the portal. The Site cannot function properly without these cookies, and they cannot be disabled.",
            },
            {
              title: "Analytics Cookies",
              colour: BRAND.violet,
              desc: "These cookies help us understand how visitors interact with our Site by collecting and reporting information anonymously. We use Google Analytics to track metrics such as session duration, pages visited, and traffic sources. This helps us improve the Site's performance and user experience.",
            },
            {
              title: "Marketing & Advertising Cookies",
              colour: BRAND.coral,
              desc: "These cookies are used to measure the effectiveness of our advertising campaigns, particularly on LinkedIn. The LinkedIn Insight Tag allows us to track conversions from LinkedIn ads and build retargeting audiences. We do not use this data to personally target you without your awareness.",
            },
            {
              title: "Functional Cookies",
              colour: "#22c55e",
              desc: "These cookies remember your preferences and choices on the Site (such as currency settings or display preferences) to provide a more personalised experience. Disabling these cookies may affect how the Site behaves for you.",
            },
          ].map((cat) => (
            <div key={cat.title} style={{ padding: 20, borderRadius: 10, background: "#fff", border: `1px solid ${BRAND.dark}0D` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: cat.colour, flexShrink: 0, display: "inline-block" }} />
                <strong style={{ fontSize: 15, color: BRAND.dark }}>{cat.title}</strong>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: `${BRAND.dark}bb`, margin: 0 }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    num: "03",
    title: "Cookies We Set",
    content: (
      <>
        <p>The table below lists the specific cookies used on this Site:</p>
        <div style={{ marginTop: 20, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13, background: "#fff", borderRadius: 10, overflow: "hidden" }}>
            <thead>
              <tr style={{ background: `${BRAND.dark}08` }}>
                {["Cookie name", "Provider", "Purpose", "Duration"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left" as const, fontWeight: 600, color: BRAND.dark, fontSize: 12, letterSpacing: "0.04em", borderBottom: `1px solid ${BRAND.dark}0D`, whiteSpace: "nowrap" as const }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cookieTable.map((row, i) => (
                <tr key={row.name} style={{ background: i % 2 === 0 ? "#fff" : `${BRAND.dark}03` }}>
                  <td style={{ padding: "11px 14px", fontFamily: "monospace", color: BRAND.violet, fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${BRAND.dark}08` }}>{row.name}</td>
                  <td style={{ padding: "11px 14px", color: `${BRAND.dark}bb`, borderBottom: `1px solid ${BRAND.dark}08` }}>{row.provider}</td>
                  <td style={{ padding: "11px 14px", color: `${BRAND.dark}bb`, borderBottom: `1px solid ${BRAND.dark}08` }}>{row.purpose}</td>
                  <td style={{ padding: "11px 14px", color: `${BRAND.dark}bb`, borderBottom: `1px solid ${BRAND.dark}08`, whiteSpace: "nowrap" as const }}>{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 14, fontSize: 13, color: `${BRAND.dark}77` }}>
          Cookie names and durations may change over time as we update our technology stack. This table reflects our best current knowledge.
        </p>
      </>
    ),
  },
  {
    num: "04",
    title: "Third-Party Cookies",
    content: (
      <>
        <p>
          Some cookies on our Site are placed by third-party services that appear on our pages. These third parties may independently collect data in accordance with their own privacy policies:
        </p>
        <ul style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10, paddingLeft: 0, listStyle: "none" }}>
          {[
            ["Google Analytics", "https://policies.google.com/privacy", "Collects aggregated usage data to help us improve the Site"],
            ["Google Tag Manager", "https://policies.google.com/privacy", "Manages the deployment of analytics and marketing tags"],
            ["LinkedIn Insight Tag", "https://www.linkedin.com/legal/privacy-policy", "Tracks ad conversions and enables retargeting on LinkedIn"],
          ].map(([name, url, desc]) => (
            <li key={name as string} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 7, flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: BRAND.coral, display: "inline-block" }} />
              <span>
                <strong>{name}</strong>{" "}(<a href={url as string} target="_blank" rel="noopener noreferrer" style={{ color: BRAND.coral, textDecoration: "underline" }}>{url as string}</a>) — {desc}
              </span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 16 }}>
          Innovatr does not control third-party cookies and is not responsible for the data practices of those third parties. We encourage you to review their privacy policies.
        </p>
      </>
    ),
  },
  {
    num: "05",
    title: "Managing Cookies",
    content: (
      <>
        <p>
          You have the right to decide whether to accept or refuse cookies. You can manage your cookie preferences in the following ways:
        </p>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column" as const, gap: 14 }}>
          {[
            {
              title: "Browser settings",
              desc: "Most web browsers allow you to control cookies through their settings preferences. You can typically set your browser to refuse all cookies, accept all cookies, or notify you when a cookie is being set. Refer to your browser's help documentation for instructions.",
            },
            {
              title: "Google Analytics opt-out",
              desc: "You can prevent Google Analytics from collecting your data by installing the Google Analytics Opt-out Browser Add-on, available at tools.google.com/dlpage/gaoptout.",
            },
            {
              title: "LinkedIn opt-out",
              desc: "You can opt out of LinkedIn's interest-based advertising by visiting your LinkedIn settings under \"Advertising data\" or via the Digital Advertising Alliance opt-out tools.",
            },
          ].map((item) => (
            <div key={item.title} style={{ padding: 16, borderRadius: 8, background: `${BRAND.violet}06`, border: `1px solid ${BRAND.violet}14` }}>
              <p style={{ fontWeight: 600, color: BRAND.dark, margin: "0 0 6px" }}>{item.title}</p>
              <p style={{ fontSize: 14, color: `${BRAND.dark}bb`, margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 16, fontSize: 14, color: `${BRAND.dark}99` }}>
          <strong>Please note:</strong> Disabling cookies may affect the functionality of this Site. In particular, disabling strictly necessary cookies may prevent you from logging in to your account or using certain features.
        </p>
      </>
    ),
  },
  {
    num: "06",
    title: "Updates to This Policy",
    content: (
      <>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our use of cookies. The date of the most recent update is shown at the top of this page.
        </p>
        <p style={{ marginTop: 12 }}>
          We encourage you to check this page periodically to stay informed about how we use cookies. Your continued use of the Site after any changes constitutes your acceptance of the updated policy.
        </p>
      </>
    ),
  },
  {
    num: "07",
    title: "Contact Us",
    content: (
      <>
        <p>If you have questions about our use of cookies or this Cookie Policy, please contact us:</p>
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

export default function CookiePolicy() {
  useSEO({
    title: "Cookie Policy",
    description: "Innovatr's cookie policy. Understand what cookies we use, why we use them, and how to manage your cookie preferences.",
    canonicalUrl: "https://www.innovatr.co.za/cookie-policy",
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
            <Cookie style={{ width: 13, height: 13, color: "#a099ff" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#a099ff", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Legal</span>
          </div>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 400, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Cookie Policy
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
            <p style={{ fontSize: 13, color: `${BRAND.dark}77`, margin: "0 0 6px" }}>Questions about how we use cookies?</p>
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
