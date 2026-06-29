/* ============================================
   ANALYTICS — Tracker privacy-friendly
   ============================================
   - Aucun cookie déposé
   - Pas de stockage d'IP côté Baye Dame
   - Une seule vue comptée par page et par session
   - Pas de fingerprint utilisateur
   - Conforme RGPD / loi sénégalaise 2008-12
   ============================================ */
(function () {
  // Skip les pages admin (déjà connectées, pas besoin de tracker)
  const path = window.location.pathname.toLowerCase();
  if (
    path.includes('admin') ||
    path === '/admin.html' ||
    path === '/admin-project.html' ||
    path === '/quote-print.html'
  ) return;

  // Une seule vue par session par page (sessionStorage = expire à la fermeture du navigateur)
  const sessionKey = 'bd_tracked_' + path;
  try {
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');
  } catch { /* private mode peut bloquer sessionStorage */ }

  // ----- Parsing du referrer -----
  function parseReferrer(ref) {
    if (!ref) return 'direct';
    const r = ref.toLowerCase();
    if (r.includes('google.')) return 'google';
    if (r.includes('instagram.')) return 'instagram';
    if (r.includes('facebook.') || r.includes('fb.com')) return 'facebook';
    if (r.includes('whatsapp.') || r.includes('wa.me')) return 'whatsapp';
    if (r.includes('twitter.') || r.includes('x.com/')) return 'twitter';
    if (r.includes('youtube.') || r.includes('youtu.be')) return 'youtube';
    if (r.includes('linkedin.')) return 'linkedin';
    if (r.includes('tiktok.')) return 'tiktok';
    if (r.includes('behance.')) return 'behance';
    if (r.includes('vimeo.')) return 'vimeo';
    try {
      const refHost = new URL(ref).hostname;
      if (refHost === window.location.hostname) return 'internal';
    } catch { /* invalid URL */ }
    return 'other';
  }

  // ----- Detection device -----
  function getDevice() {
    const ua = navigator.userAgent.toLowerCase();
    if (/ipad|tablet|kindle|silk/.test(ua)) return 'tablet';
    if (/mobile|android|iphone|ipod|opera mini|iemobile|blackberry/.test(ua)) return 'mobile';
    return 'desktop';
  }

  // ----- Send view -----
  async function recordView() {
    let country = null;
    // Récupère le pays via API gratuite (aucune donnée perso stockée côté Supabase)
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch('https://api.country.is/', { signal: ctrl.signal });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.country === 'string' && data.country.length === 2) {
          country = data.country;
        }
      }
    } catch { /* silent fail — pas grave si on a pas le pays */ }

    // Normalise le path (max 500 chars, strip query strings sensibles)
    let cleanPath = path.length > 500 ? path.substring(0, 500) : path;
    if (cleanPath === '' || cleanPath === '/') cleanPath = '/index.html';

    // Envoi à Supabase
    try {
      await fetch('https://bsaswpsgufyamrnrfkvw.supabase.co/rest/v1/page_views', {
        method: 'POST',
        keepalive: true,
        headers: {
          'apikey': 'sb_publishable_E-e-dFA7UfXdZgiRL0jr5A_gVtCfjjl',
          'Authorization': 'Bearer sb_publishable_E-e-dFA7UfXdZgiRL0jr5A_gVtCfjjl',
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          page_path: cleanPath,
          referrer_source: parseReferrer(document.referrer),
          country: country,
          device: getDevice()
        })
      });
    } catch { /* silent */ }
  }

  // On déclenche après un petit délai pour ne pas ralentir le 1er rendu
  if (document.readyState === 'complete') {
    setTimeout(recordView, 200);
  } else {
    window.addEventListener('load', () => setTimeout(recordView, 200));
  }
})();
