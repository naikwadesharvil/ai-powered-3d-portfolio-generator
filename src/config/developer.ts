/**
 * Site-Level Developer Credit Configuration
 * This represents the site's author/developer and is distinct from visitor portfolio data.
 * All developer details are kept here in one place for easy updating.
 */
export const DEVELOPER = {
  name: "Sharvil K. Naikwade",
  role: "Developer of this website",
  github: "https://github.com/naikwadesharvil",
  linkedin: "https://www.linkedin.com/in/sharvil-naikwade-2294ab2bb/",
  phone: "+91 XXXXXXXXXX", // <-- Replace with your real number
} as const;

export const DEVELOPER_CONFIG = DEVELOPER;

/**
 * Builds a safe tel: link strictly from the developer phone constant,
 * stripping all non-digit characters except '+'.
 */
export function getDeveloperTelLink(): string {
  const stripped = DEVELOPER.phone.replace(/[^\d+]/g, '');
  return `tel:${stripped}`;
}

export default DEVELOPER;
