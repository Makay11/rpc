import { createHash } from "node:crypto"

export function shortHash(string: string) {
	return createHash("sha256").update(string).digest("base64url").slice(0, 16)
}
