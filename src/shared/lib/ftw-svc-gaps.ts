export class FtwSvcGapError extends Error {
  readonly feature: string;
  readonly suggestedEndpoint: string;

  constructor(feature: string, suggestedEndpoint: string, details: string) {
    super(
      `TODO(ftw-svc): ${feature} is not implemented in ftw-svc yet. ` +
        `Add ${suggestedEndpoint}. ${details}`
    );
    this.name = "FtwSvcGapError";
    this.feature = feature;
    this.suggestedEndpoint = suggestedEndpoint;
  }
}

function throwGap(feature: string, suggestedEndpoint: string, details: string): never {
  throw new FtwSvcGapError(feature, suggestedEndpoint, details);
}

export function isFtwSvcGapError(error: unknown): error is FtwSvcGapError {
  return error instanceof FtwSvcGapError;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface HomeownerPropertyPayload {
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
}

export interface QuickBooksSupportState {
  supported: false;
  title: string;
  description: string;
  todo: string;
}

export function getQuickBooksSupportState(): QuickBooksSupportState {
  return {
    supported: false,
    title: "QuickBooks integration is migrating to ftw-svc",
    description:
      "The Next.js OAuth and billing routes were removed from the frontend migration. QuickBooks needs first-class ftw-svc endpoints before this section can reconnect.",
    todo:
      "Implement OAuth start/callback, connection status, disconnect, invoice sync, payout, receipt, and webhook endpoints in ftw-svc.",
  };
}

export async function requestPasswordReset(email: string): Promise<never> {
  return throwGap(
    "forgot password",
    "POST /api/auth/forgot-password",
    `Expected body: { email }. The frontend collected ${email ? "a user email" : "an email value"} and is ready to call ftw-svc once the endpoint exists.`
  );
}

export async function resetPassword(token: string, password: string): Promise<never> {
  return throwGap(
    "reset password",
    "POST /api/auth/reset-password",
    `Expected body: { token, password }. The reset screen already validates the token query param and a password with length ${password.length || 0}.`
  );
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<never> {
  return throwGap(
    "change password",
    "POST /api/auth/change-password",
    `Expected body: { current_password, new_password }. The settings screen currently captures both values and can call ftw-svc directly once the endpoint exists.`
  );
}

export async function submitContactForm(payload: ContactPayload): Promise<never> {
  return throwGap(
    "contact form delivery",
    "POST /api/contact",
    `Expected body: { name, email, subject, message }. The current form already produces: ${JSON.stringify(
      payload
    )}.`
  );
}

export async function saveHomeownerProperty(
  payload: HomeownerPropertyPayload
): Promise<never> {
  return throwGap(
    "homeowner property onboarding",
    "POST /api/homeowner/property",
    `Expected body: { address, city, state, zip, property_type }. The frontend currently captures ${JSON.stringify(
      payload
    )}.`
  );
}

export async function generateJobEstimate(
  jobId: string,
  force = false
): Promise<never> {
  return throwGap(
    "job-linked AI estimate generation",
    "POST /api/jobs/{jobId}/ai-estimate",
    `Current frontend needs job-scoped estimation with a force flag. Suggested body: { force: ${force} } for job ${jobId}.`
  );
}

export async function getEstimatePdf(id: string): Promise<never> {
  return throwGap(
    "estimate PDF download",
    "GET /api/estimates/{id}/pdf",
    `The estimates page still supports a PDF action and is ready to call ftw-svc for estimate ${id}.`
  );
}

export async function getQuickBooksStatus(): Promise<never> {
  return throwGap(
    "QuickBooks status lookup",
    "GET /api/integrations/quickbooks/status",
    "ftw-svc needs a connection status payload for the contractor settings page."
  );
}

export async function startQuickBooksConnect(): Promise<never> {
  return throwGap(
    "QuickBooks OAuth connect",
    "GET /api/integrations/quickbooks/connect",
    "The settings page expects a response containing an auth URL to redirect the browser."
  );
}

export async function disconnectQuickBooks(): Promise<never> {
  return throwGap(
    "QuickBooks disconnect",
    "POST /api/integrations/quickbooks/disconnect",
    "The settings page is ready to clear the connected state once ftw-svc owns the integration."
  );
}

export async function startQuickBooksSignIn(): Promise<never> {
  return throwGap(
    "QuickBooks sign-in",
    "GET /api/auth/quickbooks",
    "The login page currently offers a QuickBooks SSO button and needs a redirect URL from ftw-svc."
  );
}
