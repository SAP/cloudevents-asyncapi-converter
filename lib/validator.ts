import { CloudEvent } from './cloudevents.ts';

class PayloadValidationError extends Error {}

/**
 * @internal
 * Base class for the CloudEvents payload validator.
 */
export class PayloadValidator {

    /**
     * Validates the provided payload as for its conformance with the CloudEvents specification.
     * Presently, this method only checks for required context attributes.
     * 
     * @param payload CloudEvents payload
     * @throws {PayloadValidationError} if the payload is not an object or does not conform to
     * the CloudEvents specification.
     */
    public validate(payload: unknown): asserts payload is CloudEvent {
        this.checkType(payload);

        this.checkAttribute(payload, 'id');
        this.checkAttribute(payload, 'source');
        this.checkAttribute(payload, 'specversion', /1\.0/g);
        this.checkAttribute(payload, 'type', /[\w.]+/g);
    }

    private checkType(payload: unknown): asserts payload is Record<string, unknown> {
        if (typeof payload !== 'object' || payload === null) {
            throw new PayloadValidationError();
        }
    }

    private checkAttribute(payload: Record<string, unknown>, attribute: string, pattern?: RegExp): void {
        if (!(attribute in payload)) {
            throw new PayloadValidationError(
                `Missing context attribute '${attribute}' detected`);
        }

        // Context attributes are only strings
        if (typeof payload[attribute] !== 'string') {
            throw new PayloadValidationError(
                `Invalid type for context attribute '${attribute}' detected`);
        }

        if (pattern != null && !pattern.test(payload[attribute])) {
            throw new PayloadValidationError(
                `Invalid value for context attribute '${attribute}' detected`);
        }
    }
}