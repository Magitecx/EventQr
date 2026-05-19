import { Helmet } from "react-helmet-async";
import { buildTitle, DEFAULT_DESCRIPTION, getCanonicalUrl, getSiteUrl, SITE_NAME } from "../../lib/seo";

type SeoProps = {
  title?: string;
  description?: string;
  pathname?: string;
  imagePath?: string;
  noindex?: boolean;
  keywords?: string[];
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  pathname = "/",
  imagePath = "/og-cover.svg",
  noindex = false,
  keywords,
  structuredData,
}: SeoProps) {
  const canonicalUrl = getCanonicalUrl(pathname);
  const siteUrl = getSiteUrl();
  const socialImage = imagePath.startsWith("http") ? imagePath : `${siteUrl}${imagePath}`;
  const pageTitle = buildTitle(title);
  const robots = noindex ? "noindex,nofollow" : "index,follow";
  const structuredDataItems = Array.isArray(structuredData)
    ? structuredData
    : structuredData
      ? [structuredData]
      : [];

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta content={description} name="description" />
      <meta content={robots} name="robots" />
      <meta content={robots} name="googlebot" />
      <link href={canonicalUrl} rel="canonical" />
      <meta content={SITE_NAME} property="og:site_name" />
      <meta content="website" property="og:type" />
      <meta content={pageTitle} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={canonicalUrl} property="og:url" />
      <meta content={socialImage} property="og:image" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content={pageTitle} name="twitter:title" />
      <meta content={description} name="twitter:description" />
      <meta content={socialImage} name="twitter:image" />
      {keywords?.length ? <meta content={keywords.join(", ")} name="keywords" /> : null}
      {structuredDataItems.map((item, index) => (
        <script key={index} dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} type="application/ld+json" />
      ))}
    </Helmet>
  );
}
