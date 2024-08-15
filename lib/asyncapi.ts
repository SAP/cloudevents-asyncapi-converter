import { JSONType } from './utils/types.ts';

/**
 * @internal
 * Array of supported AsyncAPI specification versions.
 */
export const CatalogSpecVersions = ['2.0'] as const;

/**
 * @internal
 * AsyncAPI specification version.
 */
export type CatalogSpec = `v${typeof CatalogSpecVersions[number]}`;

/**
 * @internal
 * AsyncAPI event catalog structure for any given specification version.
 * 
 * @template V AsyncAPI specification version
 */
export type Catalog<V extends CatalogSpec> =
    V extends 'v2.0' ? v2_0.Catalog
  : never;

/**
 * @internal
 * AsyncAPI data type.
 */
export type DataType = 'boolean' | 'integer' | 'null' | 'number' | 'string' | 'object' | 'array';

/**
 * @internal
 * AsyncAPI data format.
 */
export type DataFormat = string;

namespace v2_0 {
    /**
     * @internal
     * AsyncAPI event catalog structure according to the specification version 2.0.x,
     * tailored to the conversion output.
     */
    export type Catalog = {
        asyncapi: string;
        info: {
            title:        string;
            version:      string;
            description?: string;
        },
        channels: {
            [channel: string]: {
                subscribe: {
                    message: {
                        $ref: string;
                    }
                }
            }
        },
        components?: {
            schemas: {
                [schema: string]: {
                    type: DataType;
                    properties?: {
                        [property: string]: {
                            type?:   DataType;
                            format?: DataFormat;
                            $ref?:   string;
                        }
                    },
                    items?: {
                        type?:   DataType;
                        format?: DataFormat;
                        $ref?:   string;
                    }
                }
            },
            messages: {
                [message: string]: {
                    name: string;
                    headers: {
                        properties: {
                            [property: string]: JSONType.Object;
                        }
                    },
                    payload: any
                    traits: {
                        $ref: string;
                    }[]
                }
            },
            messageTraits: {
                [messageTrait: string]: {
                    headers: {
                        type: string;
                        properties: {
                            [property: string]: JSONType.Object;
                        },
                        required: string[];
                    }
                }
            }
        }
    }
}