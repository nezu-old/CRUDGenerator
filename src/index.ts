#!/usr/bin/env node

import fs from 'fs';
import Config from './cfg/config';
// import util from 'util';
import { generateDatabase, generateDocument } from './generators';
import { program } from 'commander';
import path from 'path';

program
    .requiredOption('-c, --config <file>', 'Configuration file', 'config.json')
    .requiredOption('-o, --output <directory>', 'Output directory')
    .option('-d, --database', 'Also generate database')
    .option('-f, --force', 'Force override files')
    .version('0.0.2', '-v, --version');
program.parse(process.argv);

const file = fs.readFileSync(program.config);

const config = Config.fromJson(JSON.parse(file.toString()));

const php_path = path.join(program.output, config.connection_settings.database + '.php');
if(fs.existsSync(php_path) && !program.force){
    console.error(`File ${php_path} already exists, use -f to override`);
    process.exit(1);
}

const output = generateDocument(config);
fs.writeFileSync(php_path, output);
console.log(`file ${path.basename(php_path)} generated`);

if(program.database) {
    const sql_path = path.join(program.output, config.connection_settings.database + '.sql');
    if(fs.existsSync(sql_path) && !program.force){
        console.error(`File ${sql_path} already exists, use -f to override`);
        process.exit(1);
    }
    const database = generateDatabase(config);
    fs.writeFileSync(sql_path, database);
    console.log(`file ${path.basename(sql_path)} generated`);
}