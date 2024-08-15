import * as AsyncAPI from './asyncapi.ts';
import { CloudEvent, CloudEventContext } from './cloudevents.ts';
import { PayloadValidator } from './validator.ts';

import { deepClone } from './utils/helpers.ts';
import { JSONType } from './utils/types.ts';

class PayloadConversionError extends Error {}

/**
 * Abstract base class for the CloudEvents to AsyncAPI payload converter.
 * 
 * @template V AsyncAPI specification version
 */
export abstract class PayloadConverter<V extends AsyncAPI.CatalogSpec = AsyncAPI.CatalogSpec> {

    /**
     * Creates a new instance of the payload converter for the specified AsyncAPI version.
     * 
     * @param version AsyncAPI specification version, defaults to `v2.0`
     * @returns Instance of the converter
     * @throws {PayloadConversionError} if the specified version is not supported.
     */
    public static create<V extends AsyncAPI.CatalogSpec>(version?: V): PayloadConverter<V> {
        switch (version) {
            case undefined:
            case 'v2.0':
                return new PayloadConverter_v2_0() as PayloadConverter;

            default:
                throw new PayloadConversionError(
                    `Unsupported AsyncAPI version '${version}' specified`);
        }
    }

    /**
     * Converts the provided CloudEvents payload object into a corresponding AsyncAPI catalog,
     * adhering to the specification version used at creation.
     * 
     * @param payload CloudEvents payload
     * @returns Converted AsyncAPI catalog
     * @throws {PayloadConversionError} if the payload does not conform to the CloudEvents specification.
     */
    public convert(payload: Record<string, unknown>): AsyncAPI.Catalog<V> {
        try {
            const validator: PayloadValidator = new PayloadValidator();
            validator.validate(payload);
        } catch (error) {
            throw new PayloadConversionError(
                'Invalid CloudEvents object provided' + (error.message ? `; ${error.message}` : ''));
        }

        return this.doConvert(payload);
    }

    /**
     * Converts the provided CloudEvents payload as a JSON string into a corresponding AsyncAPI catalog,
     * also returned as a JSON string for convenience.
     * @see {@link convert}
     * 
     * @param rawPayload CloudEvents payload
     * @returns Converted AsyncAPI catalog in JSON
     * @throws {PayloadConversionError} if the payload is not valid JSON or does not conform to the
     * CloudEvents specification.
     */
    public convertAsString(rawPayload: string): string {
        let payload: Record<string, unknown>;
        try {
            payload = JSON.parse(rawPayload);
        } catch (error) {
            throw new PayloadConversionError(
                'Invalid CloudEvents JSON string provided' + (error.message ? `; ${error.message}` : ''));
        }

        return JSON.stringify(this.convert(payload), undefined, 2);
    }

    protected abstract doConvert(payload: CloudEvent): AsyncAPI.Catalog<V>;

    protected inferType(value: unknown): AsyncAPI.DataType {
        switch (typeof value) {
            case 'bigint':
            case 'number':
                return 'number';

            case 'boolean':
                return 'boolean';

            case 'object':
                if (value === null) {
                    return 'null';
                }
                return Array.isArray(value) ? 'array' : 'object';

            case 'string':
            case 'symbol':
                return 'string';

            default:
                throw new PayloadConversionError(
                    `Unknown AsyncAPI data type '${typeof value}' detected`);       
        }
    }

    protected inferFormat(value: unknown, type: AsyncAPI.DataType): AsyncAPI.DataFormat | undefined {
        switch (type) {
            case 'number':
                // Assume numbers are in 'decimal' format
                return 'decimal';
        }
    }
}

class PayloadConverter_v2_0 extends PayloadConverter<'v2.0'> {

    private createChannels(payload: CloudEvent) /* infer */ {
        const topic = payload.type.replaceAll('.', '_');

        return {
            [`ce/${topic.replaceAll('_', '/')}`]: {
                subscribe: {
                    message: {
                        $ref: `#/components/messages/${topic}`
                    }
                }
            }
        };
    }

    private createSchemas(payload: CloudEvent) /* infer */ {
        const topic = payload.type.replaceAll('.', '_');

        const schemas = {};

        this.transform(payload.data, topic, schemas);
        return schemas;
    }

    private createMessages(payload: CloudEvent) /* infer */ {
        const topic = payload.type.replaceAll('.', '_');

        return {
            [topic]: {
                name: payload.type,
                headers: {
                    properties: {
                        type: {
                            const: payload.type
                        }
                    }
                },
                payload: {
                    $ref: `#/components/schemas/${topic}`
                },
                traits: [
                    {
                        $ref: '#/components/messageTraits/CloudEventContext'
                    }
                ]
            }
        };
    }

    private createMessageTraits(payload: CloudEvent) /* infer */ {
        const context    = deepClone(CloudEventContext);
        const attributes = context.headers.properties;

        // Include context attributes from the payload
        for (const [key, value] of Object.entries(payload)) {
            if (key in attributes) {
                // Skip standard context attributes
                continue;
            }
            if (key.match(/^[Xx]\w+/)) {
                // Skip extension context attributes
                continue;
            }
            if (key === 'data') {
                // Skip 'data'
                continue;
            }

            const type   = this.inferType(value);
            const format = this.inferFormat(value, type);

            attributes[key] = {
                type, format
            };
        }

        // Exclude standard context attributes not present in the payload
        for (const key in attributes) {
            if (!(key in payload)) {
                delete attributes[key];
            }
        }

        return {
            CloudEventContext: context
        };
    }

    private transform(value: unknown, path: string, schemas: Record<string, unknown>) /* infer */ {
        switch (this.inferType(value)) {
            case 'object':
                return this.transformObject(value as JSONType.Object, path, schemas);

            case 'array':
                return this.transformArray(value as JSONType.Array, path, schemas);

            default:
                return this.transformValue(value as JSONType.Value, path);
        }
    }

    private transformObject(object: JSONType.Object, path: string, schemas: Record<string, unknown>) /* infer */ {
        if (Object.keys(object).length === 0) {
            throw new PayloadConversionError(`Empty object detected for '${path}', cannot infer structure`);
        }

        const schema = {
            type: 'object',
            properties: {}
        };

        for (const [key, value] of Object.entries(object)) {
            schema.properties[key] = this.transform(value, `${path}_${key}`, schemas);
        }

        return this.createReference(path, schema, schemas);
    }

    private transformArray(array: JSONType.Array, path: string, schemas: Record<string, unknown>) /* infer */ {
        const schema = {
            type: 'array',
            items: {}
        };

        if (array.length > 0) {
            switch (this.inferType(array[0])) {
                case 'object':
                    // Merge objects in array into a single one
                    const object = Object.assign({}, ...array as JSONType.Object[]);

                    this.transformObject(object, path, schemas);
                    schema.items = this.getReference(path);
                    break;

                case 'array':
                    this.transformArray(array[0] as JSONType.Array, path, schemas);
                    schema.items = this.getReference(path);
                    break;

                default:
                    schema.items = this.transformValue(array[0] as JSONType.Value, path);
                    break;
            }
        }
        return schema;
    }

    private transformValue(value: JSONType.Value, path: string) /* infer */ {
        if (value === null) {
            throw new PayloadConversionError(`'null' value detected for '${path}', cannot infer structure`);
        }

        const type = this.inferType(value);
        return {
            type,
            format: this.inferFormat(value, type)
        };
    }

    private getReference(path: string) /* infer */ {
        return {
            $ref: `#/components/schemas/${path}`
        };
    }

    private createReference(path: string, schema: Record<string, unknown>, schemas: Record<string, unknown>) /* infer */ {
        const reference = this.getReference(path);

        schemas[path] = schema;

        if ('type' in schema) {
            return {
                type: schema.type,
                ...reference
            };
        } else {
            return reference;
        }
    }

    protected override doConvert(payload: CloudEvent): AsyncAPI.Catalog<'v2.0'> {
        return {
            asyncapi:          '2.0.0',
            info: {
                title:         'Auto-generated AsyncAPI catalog',
                version:       '0.0.1',
                description:   'AsyncAPI v2.0.0 catalog converted from CloudEvents event payload.'
            },
            channels:          this.createChannels(payload),
            components: {
                messages:      this.createMessages(payload),
                schemas:       this.createSchemas(payload),
                messageTraits: this.createMessageTraits(payload)
            }
        };
    }
}