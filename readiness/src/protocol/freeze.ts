export class FrozenValue<T> {
  #value: T;
  #frozen = false;

  constructor(value: T) {
    this.#value = structuredClone(value);
  }

  freeze(): void {
    this.#frozen = true;
  }

  replace(next: T): void {
    if (this.#frozen) throw new Error("FROZEN_MUTATION");
    this.#value = structuredClone(next);
  }

  read(): T {
    return structuredClone(this.#value);
  }

  isFrozen(): boolean {
    return this.#frozen;
  }
}
