const CREDENTIAL_KEY = "credential";

/** Removes the credential saved by the authentication integration. */
export function clearCredential() {
  const credential = localStorage.getItem(CREDENTIAL_KEY);
  if (credential === null) return false;
  localStorage.removeItem(CREDENTIAL_KEY);
  return true;
}
