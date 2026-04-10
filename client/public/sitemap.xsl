<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="sitemap">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sitemap — Innovatr</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="crossorigin"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=DM+Serif+Display&amp;display=swap" rel="stylesheet"/>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #F8F7F4;
            color: #0D0B1F;
            min-height: 100vh;
          }

          header {
            background: #0D0B1F;
            padding: 20px 48px;
            display: flex;
            align-items: center;
            gap: 16px;
          }

          header a {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
          }

          .logo-mark {
            width: 36px;
            height: 36px;
            background: #3A2FBF;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .site-name {
            font-family: 'DM Serif Display', serif;
            font-size: 22px;
            color: #F8F7F4;
            letter-spacing: -0.01em;
          }

          .hdr-divider {
            width: 1px;
            height: 20px;
            background: rgba(248,247,244,0.2);
            margin: 0 4px;
          }

          .sitemap-label {
            font-size: 13px;
            color: rgba(248,247,244,0.5);
            font-weight: 500;
          }

          main {
            max-width: 960px;
            margin: 0 auto;
            padding: 48px 24px 80px;
          }

          .hero { margin-bottom: 40px; }

          .hero h1 {
            font-family: 'DM Serif Display', serif;
            font-size: 36px;
            color: #0D0B1F;
            margin-bottom: 8px;
            line-height: 1.15;
          }

          .hero p {
            font-size: 15px;
            color: rgba(13,11,31,0.55);
            line-height: 1.6;
          }

          .count-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(58,47,191,0.08);
            color: #3A2FBF;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            padding: 5px 12px;
            border-radius: 20px;
            margin-bottom: 16px;
          }

          .section { margin-bottom: 36px; }

          .section-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
          }

          .section-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .section-title {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(13,11,31,0.4);
          }

          .section-line {
            flex: 1;
            height: 1px;
            background: rgba(13,11,31,0.08);
          }

          .url-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 4px;
          }

          .url-row { background: #fff; border-radius: 10px; }

          .url-row:hover { box-shadow: 0 4px 16px rgba(13,11,31,0.07); }

          .url-row td {
            padding: 14px 20px;
            vertical-align: middle;
          }

          .url-row td:first-child { border-radius: 10px 0 0 10px; }
          .url-row td:last-child { border-radius: 0 10px 10px 0; }

          .url-link {
            font-size: 14px;
            font-weight: 600;
            color: #3A2FBF;
            text-decoration: none;
          }

          .url-link:hover { text-decoration: underline; }

          .url-sub {
            font-size: 12px;
            color: rgba(13,11,31,0.4);
            margin-top: 2px;
          }

          .url-meta {
            display: flex;
            align-items: center;
            gap: 20px;
            white-space: nowrap;
          }

          .meta-item {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }

          .meta-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: rgba(13,11,31,0.3);
          }

          .meta-value {
            font-size: 12px;
            font-weight: 600;
            color: rgba(13,11,31,0.65);
          }

          .priority-bar {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .priority-track {
            width: 48px;
            height: 4px;
            background: rgba(13,11,31,0.08);
            border-radius: 2px;
            overflow: hidden;
          }

          .priority-fill {
            height: 100%;
            border-radius: 2px;
            background: #3A2FBF;
          }

          .footer-note {
            margin-top: 48px;
            font-size: 12px;
            color: rgba(13,11,31,0.35);
            text-align: center;
            line-height: 1.6;
          }

          .footer-note a { color: #3A2FBF; }

          @media (max-width: 600px) {
            header { padding: 16px 20px; }
            main { padding: 32px 16px 60px; }
            .hero h1 { font-size: 26px; }
            .url-meta { display: none; }
            .url-row td { padding: 12px 16px; }
          }
        </style>
      </head>
      <body>

        <header>
          <a href="https://www.innovatr.co.za">
            <div class="logo-mark">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L17 7V13L10 17L3 13V7L10 3Z" fill="white" fill-opacity="0.9"/>
              </svg>
            </div>
            <span class="site-name">Innovatr</span>
          </a>
          <div class="hdr-divider"/>
          <span class="sitemap-label">Sitemap</span>
        </header>

        <main>
          <div class="hero">
            <div class="count-pill">
              <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs indexed
            </div>
            <h1>XML Sitemap</h1>
            <p>All public pages on Innovatr, organised by section. Search engines read this file automatically — last updated <xsl:value-of select="sitemap:urlset/sitemap:url[1]/sitemap:lastmod"/>.</p>
          </div>

          <!-- Core marketing pages -->
          <xsl:call-template name="url-section">
            <xsl:with-param name="label">Core pages</xsl:with-param>
            <xsl:with-param name="dot-color">#3A2FBF</xsl:with-param>
            <xsl:with-param name="nodes" select="sitemap:urlset/sitemap:url[
              sitemap:priority &gt;= 0.7
              and not(contains(sitemap:loc, '/test24'))
              and not(contains(sitemap:loc, '/consult/'))
              and not(contains(sitemap:loc, '/case-study/'))
            ]"/>
          </xsl:call-template>

          <!-- Product pages -->
          <xsl:call-template name="url-section">
            <xsl:with-param name="label">Products</xsl:with-param>
            <xsl:with-param name="dot-color">#E8503A</xsl:with-param>
            <xsl:with-param name="nodes" select="sitemap:urlset/sitemap:url[contains(sitemap:loc, '/test24')]"/>
          </xsl:call-template>

          <!-- Consult pillar pages -->
          <xsl:call-template name="url-section">
            <xsl:with-param name="label">Consult pillars</xsl:with-param>
            <xsl:with-param name="dot-color">#4EC9E8</xsl:with-param>
            <xsl:with-param name="nodes" select="sitemap:urlset/sitemap:url[contains(sitemap:loc, '/consult/')]"/>
          </xsl:call-template>

          <!-- Case study pages -->
          <xsl:call-template name="url-section">
            <xsl:with-param name="label">Case studies</xsl:with-param>
            <xsl:with-param name="dot-color">#7C6FCD</xsl:with-param>
            <xsl:with-param name="nodes" select="sitemap:urlset/sitemap:url[contains(sitemap:loc, '/case-study/')]"/>
          </xsl:call-template>

          <!-- Legal pages -->
          <xsl:call-template name="url-section">
            <xsl:with-param name="label">Legal</xsl:with-param>
            <xsl:with-param name="dot-color">rgba(13,11,31,0.25)</xsl:with-param>
            <xsl:with-param name="nodes" select="sitemap:urlset/sitemap:url[sitemap:priority &lt; 0.5]"/>
          </xsl:call-template>

          <p class="footer-note">
            This sitemap is generated for <a href="https://www.innovatr.co.za">www.innovatr.co.za</a> and complies with the
            <a href="https://www.sitemaps.org/protocol.html">Sitemaps Protocol 0.9</a>.
          </p>
        </main>

      </body>
    </html>
  </xsl:template>

  <!-- Reusable section template -->
  <xsl:template name="url-section">
    <xsl:param name="label"/>
    <xsl:param name="dot-color"/>
    <xsl:param name="nodes"/>
    <xsl:if test="$nodes">
      <div class="section">
        <div class="section-header">
          <div class="section-dot" style="background:{$dot-color}"/>
          <span class="section-title"><xsl:value-of select="$label"/></span>
          <div class="section-line"/>
        </div>
        <table class="url-table">
          <xsl:for-each select="$nodes">
            <tr class="url-row">
              <td>
                <a class="url-link" href="{sitemap:loc}">
                  <xsl:value-of select="sitemap:loc"/>
                </a>
                <div class="url-sub">
                  Last modified: <xsl:value-of select="sitemap:lastmod"/>
                  <xsl:if test="sitemap:changefreq"> · Updated <xsl:value-of select="sitemap:changefreq"/></xsl:if>
                </div>
              </td>
              <td style="width:140px">
                <div class="url-meta">
                  <div class="meta-item">
                    <span class="meta-label">Priority</span>
                    <div class="priority-bar">
                      <div class="priority-track">
                        <div class="priority-fill" style="width:{sitemap:priority * 100}%"/>
                      </div>
                      <span class="meta-value"><xsl:value-of select="sitemap:priority"/></span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </xsl:for-each>
        </table>
      </div>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
