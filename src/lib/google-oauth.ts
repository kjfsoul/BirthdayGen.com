import { readFileSync, existsSync } from "fs";
import path from "path";
import { OAuth2Client } from "google-auth-library";

const DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/contacts.readonly",
];

type GoogleClientJson = {
  web?: { client_id: string; client_secret: string; redirect_uris?: string[] };
  installed?: { client_id: string; client_secret: string; redirect_uris?: string[] };
};

function getFromEnv(name: string): string | undefined {
  const val = process.env[name];
  return val && val.trim().length > 0 ? val : undefined;
}

function loadClientFromJson(): { clientId?: string; clientSecret?: string; redirectUri?: string } {
  const jsonPath =
    getFromEnv("GOOGLE_OAUTH_CLIENT_JSON_PATH") ?? path.join(process.cwd(), "config/google/client_secret.json");
  if (!existsSync(jsonPath)) return {};
  const raw = readFileSync(jsonPath, "utf8");
  const parsed: GoogleClientJson = JSON.parse(raw);
  const blob = parsed.web ?? parsed.installed;
  return {
    clientId: blob?.client_id,
    clientSecret: blob?.client_secret,
    redirectUri: blob?.redirect_uris?.[0],
  };
}

export function getGoogleScopes(): string[] {
  const envScopes = getFromEnv("GOOGLE_PEOPLE_SCOPES");
  if (envScopes) return envScopes.split(/\s+/).filter(Boolean);
  return DEFAULT_SCOPES;
}

export function getGoogleOAuthClient(): OAuth2Client {
  const fromJson = loadClientFromJson();
  const clientId = getFromEnv("GOOGLE_CLIENT_ID") ?? fromJson.clientId;
  const clientSecret = getFromEnv("GOOGLE_CLIENT_SECRET") ?? fromJson.clientSecret;
  const redirectUri = getFromEnv("GOOGLE_OAUTH_REDIRECT_URI") ?? fromJson.redirectUri;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth not configured. Set env vars or provide config/google/client_secret.json");
  }
  return new OAuth2Client({ clientId, clientSecret, redirectUri });
}

export function base64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
