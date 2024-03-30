export type Setup<T> = (emit: Emit<T>) => Cleanup

export type Emit<T> = (value: T) => void

export type Cleanup = () => void

export class Observable<T> {
	#cleanup: Cleanup

	#subscribers = new Set<Emit<T>>()

	#closed = false

	constructor(setup: Setup<T>) {
		this.#cleanup = setup((value) => {
			this.#emit(value)
		})
	}

	#emit(value: T) {
		for (const subscriber of this.#subscribers) {
			subscriber(value)
		}
	}

	subscribe(emit: Emit<T>) {
		if (this.#closed) {
			throw new Error("Cannot subscribe to a closed observable.")
		}

		this.#subscribers.add(emit)

		return () => {
			this.#subscribers.delete(emit)

			if (this.#subscribers.size === 0) {
				this.#closed = true
				this.#cleanup()
			}
		}
	}
}
