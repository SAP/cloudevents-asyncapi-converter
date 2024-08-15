import { PayloadConverter } from '../lib/converter.ts';

const validInput = `{
  "type": "sap.eee.iwxbe.testproducer.v1.Event.DeepStructure",
  "specversion": "1.0",
  "source": "/default/sap.s4.beh/XXXCLNT400",
  "id": "42010aef-0cf0-1eee-aea3-d44e281e4f1a",
  "time": "2024-01-22T12:06:12Z",
  "additionalString": "STRING",
  "additionalNumber": 3,
  "xsapcompcode": "",
  "xsapalpha": "char",
  "xsapcurrency": "EUR",
  "datacontenttype": "application/json",
  "data": {
    "Primitive": "string",
    "PrimitiveCollection": [
      "string"
    ],
    "ComplexCollection": [
      {
        "Amount": 1,
        "Currency": "EUR",
        "Quantity": 1,
        "Unit": "KG",
        "Alpha": "char"
      },
      {
        "Amount": 1,
        "Currency": "EUR",
        "Quantity": 1,
        "Unit": "KG",
        "Alpha": "char",
        "AdditionalProp": "whichIsNotPartOfTheFirstItem"
      }
    ],
    "Complex": {
      "Amount": 1,
      "Currency": "EUR",
      "Quantity": 1,
      "Unit": "KG",
      "Alpha": "char"
    },
    "Nested": {
      "Child": {
        "Information": "string"
      }
    }
  }
}`;

const invalidInput = `{"a corrupt JSON file {{" //`;

const expectedOutput = `{
  "asyncapi": "2.0.0",
  "info": {
    "title": "Auto-generated AsyncAPI catalog",
    "version": "0.0.1",
    "description": "AsyncAPI v2.0.0 catalog converted from CloudEvents event payload."
  },
  "channels": {
    "ce/sap/eee/iwxbe/testproducer/v1/Event/DeepStructure": {
      "subscribe": {
        "message": {
          "$ref": "#/components/messages/sap_eee_iwxbe_testproducer_v1_Event_DeepStructure"
        }
      }
    }
  },
  "components": {
    "messages": {
      "sap_eee_iwxbe_testproducer_v1_Event_DeepStructure": {
        "name": "sap.eee.iwxbe.testproducer.v1.Event.DeepStructure",
        "headers": {
          "properties": {
            "type": {
              "const": "sap.eee.iwxbe.testproducer.v1.Event.DeepStructure"
            }
          }
        },
        "payload": {
          "$ref": "#/components/schemas/sap_eee_iwxbe_testproducer_v1_Event_DeepStructure"
        },
        "traits": [
          {
            "$ref": "#/components/messageTraits/CloudEventContext"
          }
        ]
      }
    },
    "schemas": {
      "sap_eee_iwxbe_testproducer_v1_Event_DeepStructure_ComplexCollection": {
        "type": "object",
        "properties": {
          "Amount": {
            "type": "number",
            "format": "decimal"
          },
          "Currency": {
            "type": "string"
          },
          "Quantity": {
            "type": "number",
            "format": "decimal"
          },
          "Unit": {
            "type": "string"
          },
          "Alpha": {
            "type": "string"
          },
          "AdditionalProp": {
            "type": "string"
          }
        }
      },
      "sap_eee_iwxbe_testproducer_v1_Event_DeepStructure_Complex": {
        "type": "object",
        "properties": {
          "Amount": {
            "type": "number",
            "format": "decimal"
          },
          "Currency": {
            "type": "string"
          },
          "Quantity": {
            "type": "number",
            "format": "decimal"
          },
          "Unit": {
            "type": "string"
          },
          "Alpha": {
            "type": "string"
          }
        }
      },
      "sap_eee_iwxbe_testproducer_v1_Event_DeepStructure_Nested_Child": {
        "type": "object",
        "properties": {
          "Information": {
            "type": "string"
          }
        }
      },
      "sap_eee_iwxbe_testproducer_v1_Event_DeepStructure_Nested": {
        "type": "object",
        "properties": {
          "Child": {
            "type": "object",
            "$ref": "#/components/schemas/sap_eee_iwxbe_testproducer_v1_Event_DeepStructure_Nested_Child"
          }
        }
      },
      "sap_eee_iwxbe_testproducer_v1_Event_DeepStructure": {
        "type": "object",
        "properties": {
          "Primitive": {
            "type": "string"
          },
          "PrimitiveCollection": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "ComplexCollection": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/sap_eee_iwxbe_testproducer_v1_Event_DeepStructure_ComplexCollection"
            }
          },
          "Complex": {
            "type": "object",
            "$ref": "#/components/schemas/sap_eee_iwxbe_testproducer_v1_Event_DeepStructure_Complex"
          },
          "Nested": {
            "type": "object",
            "$ref": "#/components/schemas/sap_eee_iwxbe_testproducer_v1_Event_DeepStructure_Nested"
          }
        }
      }
    },
    "messageTraits": {
      "CloudEventContext": {
        "headers": {
          "type": "object",
          "properties": {
            "id": {
              "description": "Identifies the event.",
              "type": "string",
              "minLength": 1
            },
            "specversion": {
              "description": "The version of the CloudEvents specification which the event uses.",
              "type": "string",
              "const": "1.0"
            },
            "source": {
              "description": "Identifies the context in which an event happened.",
              "type": "string",
              "format": "uri-reference",
              "minLength": 1
            },
            "type": {
              "description": "Describes the type of the event related to the source the event originated in.",
              "type": "string",
              "minLength": 1
            },
            "time": {
              "description": "Timestamp of when the occurrence happened.",
              "type": "string",
              "format": "date-time"
            },
            "datacontenttype": {
              "description": "Content type of the event data.",
              "type": "string",
              "const": "application/json"
            },
            "additionalString": {
              "type": "string"
            },
            "additionalNumber": {
              "type": "number",
              "format": "decimal"
            }
          },
          "required": [
            "id",
            "source",
            "specversion",
            "type"
          ]
        }
      }
    }
  }
}`;

describe('PayloadConverter for AsyncAPI v2.0.x', () => {
    let converter: PayloadConverter;

    beforeEach(() => {
        converter = PayloadConverter.create('v2.0');
    });

    describe('convert() with valid CloudEvents JSON payload', () => {
        it('should generate correct AsyncAPI catalog', () => {
            const actualOutput = converter.convertAsString(validInput);
            expect(actualOutput).toEqual(expectedOutput);
        });
    });

    describe('convert() with malformed CloudEvents JSON payload', () => {
        it('should throw exception', () => {
            expect(() => converter.convertAsString(invalidInput)).toThrow();
        });
    });
});
