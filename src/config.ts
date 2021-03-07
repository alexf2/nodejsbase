import convict from 'convict';
import {ipaddress} from 'convict-format-with-validator';
// Для загрузки build-specific конфига используем синхронную версию
import {existsSync} from 'fs';
import * as path from 'path';

convict.addFormat(ipaddress);

// Тут описываем мету для нашего конфига со значениями по-умолчанию.
// Для каждой разновидности билда/запуска (test, production, development) в отдельной корневой папке проекта подкладывается частичный config,
// который переопределяет только нужные параметры конфигурации.
export const config: convict.Config = convict({
    data: {
        folder: {
            doc: 'Folder for data files. Should be specified relative to process root.',
            format: String,
            default: undefined,
        },
        ['task2-source-file']: {
            doc: 'CSV file name for task2',
            format: String,
            default: undefined,
        },
        ['csv-delimiter']: {
            doc: 'CSV columns delimiter',
            format: String,
            default: ',',
        },
        ['input-encoding']: {
            doc: 'CSV encoding',
            format: ['utf8', 'ascii', 'base64', 'hex', 'ucs2', 'binary'],
            default: 'utf8',
        },
        ['out-encoding']: {
            doc: 'JSON encoding',
            format: ['utf8', 'ascii', 'base64', 'hex', 'ucs2', 'binary'],
            default: 'utf8',
        },
    },
    env: {
        doc: 'The applicaton environment.',
        format: ['production', 'development', 'test'],
        default: 'development',
        env: 'NODE_ENV',
    },
    ip: {
        doc: 'The IP address to bind.',
        format: 'ipaddress',
        default: '127.0.0.1',
        env: 'IP_ADDRESS',
    },
    port: {
        doc: 'The port to bind.',
        format: 'port',
        default: 5000,
        env: 'PORT',
    },
    reqIdHeader: {
        doc: 'The header where request ID is',
        format: String,
        default: 'api-request-id',
        env: 'REQUEST_ID_HEADER',
    },
    logger: {
        level: {
            doc: 'Logging level',
            level: ['debug', 'info', 'warn', 'error'],
            default: 'debug',
            env: 'LOG_LEVEL',
        },
        colorize: {
            doc: 'Colorize the logs or not',
            format: Boolean,
            default: true,
        },
        prettyPrint: {
            doc: 'Pretty print the extra data',
            format: Boolean,
            default: true,
            env: 'LOG_PRETTY',
        },
        json: {
            doc: 'Print logs as JSON',
            format: Boolean,
            default: false,
            env: 'LOG_JSON',
        },
    },
});

const configFile = path.join(process.cwd(), 'config', `${config.get('env')}.json`);

if (existsSync(configFile)) {
    config
        .loadFile(configFile)
        .validate({allowed: 'strict'});
}

/**
 * Хэлперы для получения конфигурации.
 */
export class Config {
    static get docFolder() { 
        return path.join(process.cwd(), config.get('data.folder'));
    }
    static get task2FilePath() {
        return path.join(Config.docFolder, config.get('data.task2-source-file'));
    }
    static get csvDelimiter() {
        return config.get('data.csv-delimiter')
    }
    static get inputEncoding() {
        return config.get('data.input-encoding')
    }
    static get outEncoding() {
        return config.get('data.out-encoding')
    }
}
