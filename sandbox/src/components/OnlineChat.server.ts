import { useUser } from "../server/auth"

export async function getUser() {
	return useUser()
}
