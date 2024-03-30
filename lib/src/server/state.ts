import { AsyncLocalStorage } from "node:async_hooks"

export function defineState<State extends NonNullable<unknown>>() {
	const asyncLocalStorage = new AsyncLocalStorage<State>()

	function createState(state: State) {
		if (asyncLocalStorage.getStore() != null) {
			throw new Error("State has already been created.")
		}

		asyncLocalStorage.enterWith(state)

		return state
	}

	function clearState() {
		asyncLocalStorage.enterWith(undefined as unknown as State)
	}

	function replaceState(state: State) {
		asyncLocalStorage.enterWith(state)

		return state
	}

	function useState() {
		return asyncLocalStorage.getStore()
	}

	function useStateOrThrow() {
		const state = asyncLocalStorage.getStore()

		if (state == null) {
			throw new Error("State has not been created.")
		}

		return state
	}

	return {
		createState,
		clearState,
		replaceState,
		useState,
		useStateOrThrow,
	}
}
