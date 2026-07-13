// Vorschau-Schutz: HTTP Basic Auth für die ganze Website.
// Aktiv nur, wenn in Cloudflare Pages die Umgebungsvariable SITE_PASSWORD
// gesetzt ist (Settings → Environment variables). Variable löschen und neu
// deployen → Website ist öffentlich. Der Benutzername ist egal.
export async function onRequest({ request, env, next }) {
  if (!env.SITE_PASSWORD) {
    return next();
  }

  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Basic ")) {
    const decoded = atob(auth.slice(6));
    const password = decoded.slice(decoded.indexOf(":") + 1);
    if (password === env.SITE_PASSWORD) {
      return next();
    }
  }

  return new Response("Diese Vorschau ist passwortgeschützt.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Vorschau Qigong Aargau", charset="UTF-8"',
      "Content-Type": "text/plain; charset=UTF-8",
    },
  });
}
