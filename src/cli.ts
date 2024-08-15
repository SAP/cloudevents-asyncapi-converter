#!/usr/bin/env node

import fs from 'node:fs/promises';
import process from 'node:process';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import * as AsyncAPI from '../lib/asyncapi.ts';
import { PayloadConverter } from '../lib/converter.ts';

interface Cli {
    input?:  string;
    output?: string;
    version: string;
}

const command = yargs(hideBin(process.argv))
    .scriptName('ce2async')
    .usage('$0 [input path] [--output|-o path] [--version|-v version] [--help]')
    .help(true).showHelpOnFail(false)
    .version(false)
    .command('$0 [input]',
        'Convert a CloudEvents payload to an AsyncAPI file',
        command => {
            return command
                .positional('input', {
                    type: 'string',
                    description: 'Path to input file'
                })
                .option('output', {
                    type: 'string',
                    alias: 'o',
                    description: 'Path to output file'
                })
                .option('version', {
                    type: 'string',
                    choices: AsyncAPI.CatalogSpecVersions,
                    default: '2.0',
                    alias: 'v',
                    description: 'AsyncAPI specification version',
                })
        },
        argv => processPayload(argv as Cli)
    )
    .strict();

await command.parse();

async function processPayload(argv: Cli) {
    let input: Buffer;
    try {
        if (argv.input) {
            input = await fs.readFile(argv.input);
        } else {
            if (process.stdin.isTTY) {
                command.showHelp('log');
                return;
            }

            input = Buffer.concat(await process.stdin.toArray());
        }
    } catch {
        throw 'Error: Failed to read input';
    }

    let output: string;
    try {
        const converter = PayloadConverter.create(`v${argv.version}` as AsyncAPI.CatalogSpec);
        output = converter.convertAsString(input.toString().trim());
    } catch (error) {
        throw `Error: Failed to convert input; ${error.message}`;
    }

    try {
        if (argv.output) {
            await fs.writeFile(argv.output, output, 'utf-8');
        } else {
            process.stdout.write(output);
        }
    } catch {
        throw 'Error: Failed to write output';
    }
}