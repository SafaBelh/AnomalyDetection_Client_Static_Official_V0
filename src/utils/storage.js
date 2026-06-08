export const STORAGE_KEY = "anomalyiq.state.v2";
export function loadStorage() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}
export function saveStorage(db) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeTenantId: db.activeTenantId,
        activeTenantName: db.activeTenantName,
        activePartnerId: db.activePartnerId,
        isSSO: db.isSSO,
        isEngineAdmin: db.isEngineAdmin,
      })
    );
  } catch {}
}
