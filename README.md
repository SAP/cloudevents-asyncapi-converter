[![REUSE status](https://api.reuse.software/badge/github.com/SAP/cloudevents-asyncapi-converter)](https://api.reuse.software/info/github.com/SAP/cloudevents-asyncapi-converter)

# Converter for CloudEvents to AsyncAPI

*Converter for CloudEvents to AsyncAPI* is a Node.js library and CLI application that converts any event payload conforming to the [CloudEvents](https://github.com/cloudevents/spec) specification into an [AsyncAPI](https://www.asyncapi.com/docs) catalog which can be used in an ABAP environment to generate an [Event Consumption Model](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/generating-event-consumption-model).

Find the official web application hosted on GitHub Pages at https://sap.github.io/cloudevents-asyncapi-converter.

> [!NOTE]
> CloudEvents® is a registered trademark of The Linux Foundation.


## Installation

### Prerequisites

- Node.js version 20.x or above
- npm version 9.x or above

### Steps

1. Clone the repository
2. Navigate to the repository's root folder
3. Install the package and its dependencies

```bash
npm install && npm install -g .
```

> [!TIP]
> If you wish to install and use the package locally (i.e. not system-wide), simply drop the second `npm install` command.


## Usage

### Command Line

To convert a CloudEvents payload in JSON format to a corresponding AsyncAPI catalog, this package offers the following command:

```
ce2async [input path] [--output|-o path] [--version|-v version] [--help]
```

* **Arguments:**
  - `input`\
  Path to the input file containing the CloudEvents payload. If not specified, the input is read from _stdin_ instead. If the payload is invalid, the command will fail with a non-zero exit code and print an error message to _stderr_.

* **Options:**
  - `--output`, `-o`\
  Path to the output file that will contain the AsyncAPI catalog. If not specified, the output is written to _stdout_ instead.

  - `--version`, `-v`\
  Version of the AsyncAPI specification to use for conversion. Presently, only version `2.0` for AsyncAPI 2.0.x is supported.

  - `--help`\
  Help page for this command.

> [!TIP]
> In case you only installed the package locally, you must run the command with `npx` from within the repository.

#### Example

As an example, suppose you want to convert the payload in `examples/input.json` to an AsyncAPI 2.0.x catalog file. To achieve that, simply run

```bash
ce2async examples/input.json -o output.json
```

The file `output.json` now contains the corresponding AsyncAPI catalog, exactly as in `examples/output.json`.

Or alternatively, to read some event payload from _stdin_ and write the converted result to _stdout_, instead run

```bash
echo '{"type":"sap.eee.iwxbe.testproducer.v1.Event.Conversion","specversion":"1.0","source":"/default/sap.eee/XXXCLNT400","id":"42010aef-0cee-1edb-879d-6a2c14dc9326","time":"2020-11-02T09:10:57Z","datacontenttype":"application/json","data":{"Amount":100.0,"Currency":"KWD","Quantity":1000.0,"Unit":"KG","Alpha":"1"}}' | ce2async
```

### API

Although this package is intended to be primarily used as a CLI application, it also provides an API to perform the conversion programmatically. As to that, the package exports a single class `PayloadConverter`, which offers the following methods:

* **Static Methods:**
  - `create(version?: string): PayloadConverter;`\
    Creates a new instance of a `PayloadConverter` for the optionally specified AsyncAPI specification `version`, assuming `v2.0` by default. Throws an error when `version` is invalid or not supported.

* **Instance Methods:**
  - `convert(payload: object): object;`\
    Converts a CloudEvents `payload` object to a corresponding AsyncAPI catalog object, using the converter's specification version. Throws an error when `payload` is malformed according to the CloudEvents specification.

  - `convertAsString(payload: string): string;`\
    Functions like `convert(...)` but accepts a JSON string as an input, which is parsed before converting. Returns the output as a JSON string as well.

#### Example

```javascript
import { PayloadConverter } from 'cloudevents-asyncapi-converter';

const converter = PayloadConverter.create();

const input = '...'; // some CloudEvents JSON string
try {
    const output = converter.convertAsString(input);
    // conversion succeeded
} catch (error) {
    // conversion failed
}
```

### Limitations

The payload converter only generates a rough AsyncAPI catalog solely based on the CloudEvents payload by inferring data types in a naïve manner. Consequently, it exhibits some limitations that require manual adjustments to the payload prior to conversion or to the resulting catalog.

* Properties with value `null` or empty objects `{}` in the payload are currently rejected by the converter.
* String properties are not analyzed with regards to their data format and have none assigned.
* Numeric properties always receive the data format `decimal` by the converter.
* For compositions of objects, the converter is currently unable to link parent and child schemas through references. Instead, it treats them independently of each other.

  <details>
    <summary><b>Details</b></summary>

  Suppose your payload has nested schemas like the `ComplexCollection` below, containing objects of the type `Complex`.

  ```json
  // ...
  "ComplexCollection": [
    {
      "Amount": 100.000,
      "Currency": "KWD",
      "Quantity": 1000.000,
      "Unit": "KG",
      "Alpha": "1"
    },
    // ...
  ],
  "Complex": {
    "Amount": 0.000,
    "Currency": "KWD",
    "Quantity": 0.000,
    "Unit": "KG",
    "Alpha": "1"
  },
  // ...
  ```

  Rather than linking the items of `ComplexCollection` to the `Complex` schema, the converter creates individual schemas for each object.

  ```json
  // ...
  "schemas": {
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
    // ...
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
    }
  }
  ```
  </details>


## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/SAP/cloudevents-asyncapi-converter/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).


## Security / Disclosure

If you find any bug that may be a security problem, please follow our instructions at [in our security policy](https://github.com/SAP/cloudevents-asyncapi-converter/security/policy) on how to report it. Please do not create GitHub issues for security-related doubts or problems.


## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](https://github.com/SAP/.github/blob/main/CODE_OF_CONDUCT.md) at all times.


## Licensing

Copyright 2024 SAP SE or an SAP affiliate company and *cloudevents-asyncapi-converter* contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/cloudevents-asyncapi-converter).
