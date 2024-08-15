import { PayloadConverter } from '../lib/converter.ts';

const cloudEvent = `
{
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

const converter = PayloadConverter.create();

const asyncApi = converter.convertAsString(cloudEvent);
console.log(asyncApi);
