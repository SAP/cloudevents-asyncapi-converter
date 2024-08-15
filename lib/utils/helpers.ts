type Mutable<T extends object> = {
    -readonly [P in keyof T]: T[P] extends object ? Mutable<T[P]> : T[P];
};

export function deepClone<T extends object>(object: T): Mutable<T> {
    return structuredClone(object);
}