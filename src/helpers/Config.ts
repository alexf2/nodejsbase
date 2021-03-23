import * as path from 'path';
import {config, getInitialized, initilaizeConfig} from '../appConfig';

const validateConfig = () => {
    if (getInitialized()) {
        return;
    }
    // throw new Error('Конфигурация должна быть проинициализирована вызовом initilaizeConfig при старте приложения');
    initilaizeConfig(); // ленивая инициализация
}

/**
 * Хэлперы для получения конфигурации.
 */
export class Config {
    // data
    static get docFolder() { 
        validateConfig();
        return path.join(process.cwd(), config.get('data.folder')!);
    }
    static get task2FilePath() {
        validateConfig();
        return path.join(Config.docFolder, config.get('data.task2-source-file')!);
    }
    static get csvDelimiter() {
        validateConfig();
        return config.get('data.csv-delimiter')
    }
    static get inputEncoding() {
        validateConfig();
        return config.get('data.input-encoding') as BufferEncoding;
    }
    static get outEncoding() {
        validateConfig();
        return config.get('data.out-encoding') as BufferEncoding;
    }

    // server
    static get ip() {
        validateConfig();
        return config.get('server.ip')
    }
    static get port() {
        validateConfig();
        return config.get('server.port')
    }
    static get reqIdHeader() {
        validateConfig();
        return config.get('server.reqIdHeader')
    }

    // logging
    static get logLevel() {
        validateConfig();
        return config.get('logger.level')
    }
    static get logTransport() {
        validateConfig();
        return config.get('logger.transport')
    }
    static get logFormat() {
        validateConfig();
        return config.get('logger.format')
    }
}

export const getOutFilePath = filePath => {
    const {ext, base, ...rest} = path.parse(filePath);
    return path.format({...rest, ext: '.json'});
};
