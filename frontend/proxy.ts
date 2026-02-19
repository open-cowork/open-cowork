import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import acceptLanguage from "accept-language";
import {
  fallbackLng,
  languages,
  cookieName,
  headerName,
} from "@/lib/i18n/settings";

acceptLanguage.languages(languages);

export const config = {
  matcher: [
    // Exclude Next internals and static assets (e.g. /logo.jpg) from locale redirects.
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest|.*\\..*).*)",
  ],
};

/**
 * Next.js middleware for i18n locale detection and routing.
 *
 * Responsibilities:
 * - Detect user language from cookie, Accept-Language header, or URL path
 * - Redirect to locale-prefixed routes when missing
 * - Persist detected language in response headers and cookies
 */
export function proxy(req: NextRequest) {
  const url = new URL(req.url);

  // Skip icon and chrome-related paths
  if (
    url.pathname.indexOf("icon") > -1 ||
    url.pathname.indexOf("chrome") > -1
  ) {
    return NextResponse.next();
  }

  // 1. Detect language from cookie
  let lng: string | undefined;
  if (req.headers.has("cookie")) {
    const cookies = req.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim());
    const i18nCookie = cookies?.find((c) => c.startsWith(`${cookieName}=`));
    if (i18nCookie) {
      const value = i18nCookie.split("=")[1];
      lng = acceptLanguage.get(value) ?? undefined;
    }
  }

  // 2. Fallback to Accept-Language header
  if (!lng) {
    lng = acceptLanguage.get(req.headers.get("Accept-Language")) ?? undefined;
  }

  // 3. Final fallback
  if (!lng) lng = fallbackLng;

  // 4. Check if locale already exists in path
  const lngInPath = languages.find((loc) =>
    url.pathname.startsWith(`/${loc}`),
  );

  const headers = new Headers(req.headers);
  headers.set(headerName, lngInPath || lng);

  // 5. Redirect to locale-prefixed path if missing
  if (!lngInPath && !url.pathname.startsWith("/_next")) {
    return NextResponse.redirect(
      new URL(`/${lng}${url.pathname}${url.search}`, req.url),
    );
  }

  // 6. Persist language from referer
  if (req.headers.has("referer")) {
    const refererUrl = new URL(req.headers.get("referer")!);
    const lngInReferer = languages.find((l) =>
      refererUrl.pathname.startsWith(`/${l}`),
    );

    const response = NextResponse.next({ headers });
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
    return response;
  }

  return NextResponse.next({ headers });
}
