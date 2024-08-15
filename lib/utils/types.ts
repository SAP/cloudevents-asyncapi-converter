export namespace JSONType {
    export type Value  = bigint | boolean | null | number | string;

    export type Object = {} | { [property: string]: Any };

    export type Array  = Any[];

    export type Any    = Value | Object | Array;
}