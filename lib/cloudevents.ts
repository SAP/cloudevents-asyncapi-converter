import { JSONType } from './utils/types.ts';

const ContextAttributes = {
    Required: [
        'id',
        'source',
        'specversion',
        'type'
    ],
    Optional: [
        'subject',
        'time',
        'datacontenttype',
        'dataschema'
    ]
} as const;

namespace ContextAttribute {
    export type Required = typeof ContextAttributes.Required[number];
    export type Optional = typeof ContextAttributes.Optional[number];
}

/**
 * @internal
 * CloudEvents event payload structure according to the specification version 1.0.
 * This structure assumes a data type of `application/json` for the conversion.
 */
export type CloudEvent = {
    [attribute in ContextAttribute.Required]: string;
} & {
    [attribute in ContextAttribute.Optional]?: string;
} & {
    data: JSONType.Object,
} & {
    [attribute: string]: JSONType.Any;
}

/**
 * @internal
 * Object of CloudEvents context attributes modeled as AsyncAPI message traits.
 */
export const CloudEventContext = {
    headers: {
        type: 'object',
        properties: {
            id: {
                description: 'Identifies the event.',
                type: 'string',
                minLength: 1
            },
            specversion: {
                description: 'The version of the CloudEvents specification which the event uses.',
                type: 'string',
                const: '1.0'
            },
            source: {
                description: 'Identifies the context in which an event happened.',
                type: 'string',
                format: 'uri-reference',
                minLength: 1
            },
            type: {
                description: 'Describes the type of the event related to the source the event originated in.',
                type: 'string',
                minLength: 1
            },
            subject: {
                description: 'Describes the subject of the event in the context of the source the event originated in.',
                type: 'string',
                minLength: 1
            },
            time: {
                description: 'Timestamp of when the occurrence happened.',
                type: 'string',
                format: 'date-time'
            },
            datacontenttype: {
                description: 'Content type of the event data.',
                type: 'string',
                const: 'application/json',
            },
            dataschema: {
                description: 'Identifies the schema that the event data adheres to.',
                type: 'string',
                format: 'uri',
                minLength: 1
            }
        },
        required: ContextAttributes.Required,
    }
};