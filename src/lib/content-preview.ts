import "server-only";

export function localContentPreviewEnabled() {
  return process.env.NODE_ENV === "development"
    && process.env.DATABASE_URL === "postgresql://chitouen_local@127.0.0.1:55432/chitouen_local";
}
