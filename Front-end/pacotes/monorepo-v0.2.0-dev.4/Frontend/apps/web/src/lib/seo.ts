import type { MetaDescriptor } from "react-router";

type SeoMatch = {
  id: string;
  loaderData?: unknown;
};

type SeoArgs = {
  matches: ReadonlyArray<SeoMatch>;
  location: {
    pathname: string;
  };
};

type SeoOptions = {
  title: string;
  description: string;
  image?: unknown;
  jsonLd?: Record<string, unknown>;
};

function getSiteOrigin(matches: ReadonlyArray<SeoMatch>): string | undefined {
  const orderedMatches = [
    ...matches.filter((match) => match.id === "root"),
    ...matches.filter((match) => match.id !== "root"),
  ];

  for (const match of orderedMatches) {
    const data = match.loaderData;

    if (data && typeof data === "object" && "origin" in data) {
      const origin = (data as { origin?: unknown }).origin;

      if (typeof origin === "string") {
        try {
          return new URL(origin).origin;
        } catch {
          continue;
        }
      }
    }
  }

  return undefined;
}

function extractImageUrl(image: unknown): string | undefined {
  if (typeof image === "string") {
    return image;
  }

  if (!image || typeof image !== "object") {
    return undefined;
  }

  const value = image as Record<string, unknown>;

  for (const key of ["src", "url", "href", "imageUrl", "path"]) {
    if (typeof value[key] === "string") {
      return value[key] as string;
    }
  }

  for (const key of ["image", "asset", "desktop"]) {
    const result = extractImageUrl(value[key]);

    if (result) return result;
  }

  return undefined;
}

function makeAbsoluteUrl(
  value: string | undefined,
  origin?: string
): string | undefined {
  if (!value) return undefined;

  try {
    return new URL(value).href;
  } catch {
    if (!origin) return undefined;

    try {
      return new URL(value, origin).href;
    } catch {
      return undefined;
    }
  }
}

export function seo(
  { matches, location }: SeoArgs,
  options: SeoOptions
): MetaDescriptor[] {
  const origin = getSiteOrigin(matches);

  const canonical = origin
    ? new URL(location.pathname, origin).href
    : undefined;

  const image = makeAbsoluteUrl(
    extractImageUrl(options.image),
    origin
  );

  const descriptors: MetaDescriptor[] = [
    { title: options.title },

    {
      name: "description",
      content: options.description,
    },

    {
      property: "og:type",
      content: "website",
    },

    {
      property: "og:title",
      content: options.title,
    },

    {
      property: "og:description",
      content: options.description,
    },

    {
      name: "twitter:card",
      content: image ? "summary_large_image" : "summary",
    },

    {
      name: "twitter:title",
      content: options.title,
    },

    {
      name: "twitter:description",
      content: options.description,
    },
  ];

  if (canonical) {
    descriptors.push(
      {
        tagName: "link",
        rel: "canonical",
        href: canonical,
      },
      {
        property: "og:url",
        content: canonical,
      }
    );
  }

  if (image) {
    descriptors.push(
      {
        property: "og:image",
        content: image,
      },
      {
        name: "twitter:image",
        content: image,
      }
    );
  }

  if (options.jsonLd) {
    const structuredData = { ...options.jsonLd };

    if (canonical && !structuredData.url) {
      structuredData.url = canonical;
    }

    descriptors.push({
      "script:ld+json": structuredData,
    });
  }

  return descriptors;
}
