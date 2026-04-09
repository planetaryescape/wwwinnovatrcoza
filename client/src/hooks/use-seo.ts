import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_TITLE = "Innovatr - Smart Research in 24 Hours";
const DEFAULT_DESC = "AI-powered, decision-centric testing. Local insights. Market-ready answers—all within 24 hours. Test ideas today, get answers tomorrow.";
const DEFAULT_OG_DESC = "AI-powered, decision-centric testing. Local insights. Market-ready answers—all within 24 hours.";
const DEFAULT_URL = "https://www.innovatr.co.za";
const SCRIPT_ID = "page-seo-jsonld";

function upsertMeta(selector: string, attrKey: string, attrVal: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrKey, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

function upsertCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSEO({ title, description, canonicalUrl, ogImage, jsonLd }: SEOProps) {
  const jsonLdString = jsonLd !== undefined ? JSON.stringify(jsonLd) : undefined;

  useEffect(() => {
    const prevTitle = document.title;
    const fullTitle = `${title} | Innovatr`;

    document.title = fullTitle;

    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertCanonical(canonicalUrl);

    if (ogImage) {
      upsertMeta('meta[property="og:image"]', "property", "og:image", ogImage);
      upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);
    }

    if (jsonLdString) {
      let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = jsonLdString;
    }

    return () => {
      document.title = prevTitle;
      upsertMeta('meta[name="description"]', "name", "description", DEFAULT_DESC);
      upsertMeta('meta[property="og:title"]', "property", "og:title", DEFAULT_TITLE);
      upsertMeta('meta[property="og:description"]', "property", "og:description", DEFAULT_OG_DESC);
      upsertMeta('meta[property="og:url"]', "property", "og:url", DEFAULT_URL);
      upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", DEFAULT_TITLE);
      upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", DEFAULT_OG_DESC);
      upsertCanonical(DEFAULT_URL);
      const script = document.getElementById(SCRIPT_ID);
      if (script) script.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonicalUrl, ogImage, jsonLdString]);
}
