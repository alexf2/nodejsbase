import * as path from 'path';
import {config, getInitialized} from '../appConfig';

const validateConfig = () => {
    if (getInitialized()) {
        return;
    }
    throw new Error('Конфигурация должна быть проинициализирована вызовом initilaizeConfig при старте приложения');
}

/**
 * Хэлперы для получения конфигурации.
 */
export class Config {
    static get docFolder() { 
        validateConfig();
        return path.join(process.cwd(), config.get('data.folder'));
    }
    static get task2FilePath() {
        validateConfig();
        return path.join(Config.docFolder, config.get('data.task2-source-file'));
    }
    static get csvDelimiter() {
        validateConfig();
        return config.get('data.csv-delimiter')
    }
    static get inputEncoding() {
        validateConfig();
        return config.get('data.input-encoding')
    }
    static get outEncoding() {
        validateConfig();
        return config.get('data.out-encoding')
    }
}
