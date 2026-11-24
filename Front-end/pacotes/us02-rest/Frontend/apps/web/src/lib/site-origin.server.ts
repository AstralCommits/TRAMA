export function siteOrigin(request: Request): string {
  return new URL(request.url).origin;
}
