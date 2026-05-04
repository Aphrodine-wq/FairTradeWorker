/** Cookie values set by the login page "Demo" buttons — middleware + layouts use these. */
export const DEMO_ACCESS_TOKENS = new Set([
  "demo.contractor",
  "demo.homeowner",
  "demo.subcontractor",
]);

const DASHBOARD_BY_TOKEN: Record<string, string> = {
  "demo.contractor": "/demo/contractor/dashboard",
  "demo.homeowner": "/demo/homeowner/dashboard",
  "demo.subcontractor": "/demo/subcontractor/dashboard",
};

export function demoDashboardUrl(token: string): string | null {
  return DASHBOARD_BY_TOKEN[token] ?? null;
}

export function demoSegmentForPath(pathname: string): "contractor" | "homeowner" | "subcontractor" | null {
  if (pathname.startsWith("/demo/contractor")) return "contractor";
  if (pathname.startsWith("/demo/homeowner")) return "homeowner";
  if (pathname.startsWith("/demo/subcontractor")) return "subcontractor";
  return null;
}
