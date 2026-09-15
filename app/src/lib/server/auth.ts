import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function requireEnv(name: 'ADMIN_PASSWORD' | 'SESSION_SECRET'): string {
	const value = env[name];
	if (!value) throw new Error(`${name} ist nicht gesetzt (siehe env.example)`);
	return value;
}

function sign(value: string, secret: string): string {
	return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function makeAdminCookie(): { name: string; value: string; opts: CookieOpts } {
	const secret = requireEnv('SESSION_SECRET');
	const issuedAt = Date.now().toString();
	const sig = sign(issuedAt, secret);
	return {
		name: COOKIE_NAME,
		value: `${issuedAt}.${sig}`,
		opts: {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: COOKIE_MAX_AGE
		}
	};
}

export function isAdminCookieValid(cookieValue: string | undefined): boolean {
	if (!cookieValue) return false;
	const secret = requireEnv('SESSION_SECRET');
	const [issuedAt, sig] = cookieValue.split('.');
	if (!issuedAt || !sig) return false;
	if (!safeEqual(sig, sign(issuedAt, secret))) return false;
	const age = Date.now() - parseInt(issuedAt, 10);
	if (age > COOKIE_MAX_AGE * 1000) return false;
	return true;
}

export function checkPassword(input: string): boolean {
	return safeEqual(input, requireEnv('ADMIN_PASSWORD'));
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

type CookieOpts = {
	path: string;
	httpOnly?: boolean;
	sameSite?: 'lax' | 'strict' | 'none';
	secure?: boolean;
	maxAge: number;
};
