/**
 * Cloudflare Pages Functions：サイト全体にBasic認証をかける
 *
 * ID・パスワードはコードに書かず、Cloudflareの環境変数で設定する
 *   BASIC_AUTH_USER … ユーザー名
 *   BASIC_AUTH_PASS … パスワード（「暗号化」にチェックして登録）
 */

const REALM = 'SIBUSAWA LP';

async function sha256(text) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
}

// 長さや一致位置から推測されないよう、ハッシュ同士を一定時間で比較する
async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

function decodeBasic(header) {
  const [scheme, encoded] = (header || '').split(' ');
  if (scheme !== 'Basic' || !encoded) return null;
  try {
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const i = decoded.indexOf(':');
    return i === -1 ? null : { user: decoded.slice(0, i), pass: decoded.slice(i + 1) };
  } catch {
    return null;
  }
}

function unauthorized() {
  return new Response('認証が必要です。', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Content-Type': 'text/plain; charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequest({ request, env, next }) {
  const user = env.BASIC_AUTH_USER;
  const pass = env.BASIC_AUTH_PASS;

  // 環境変数が未設定のときは、誤って公開されないよう全て拒否する
  if (!user || !pass) {
    return new Response('認証設定が未完了です。', { status: 503 });
  }

  const cred = decodeBasic(request.headers.get('Authorization'));
  if (!cred) return unauthorized();

  const [okUser, okPass] = await Promise.all([safeEqual(cred.user, user), safeEqual(cred.pass, pass)]);
  if (!okUser || !okPass) return unauthorized();

  // 確認用サイトなので検索エンジンには載せない
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('X-Robots-Tag', 'noindex, nofollow');
  out.headers.set('Cache-Control', 'private, no-store');
  return out;
}
