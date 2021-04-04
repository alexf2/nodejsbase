import * as path from 'path';
import * as dotenv from 'dotenv';
import {Config, loggers} from './';

/**
 * Загружает в переменные окружения Node конфигурацию DotEnv, которая хранится в файлах .env.environment_name
 * в корне проекта, на уровне package.json. Грузится файл с суффиксом из текуцщей NODE_ENV.
 */
export const initializeDotEnvConfiguration = () => {
    const dotConfig = dotenv.config({path: path.join(process.cwd(), `.env.${Config.env}`)});
    const {error, parsed} = dotConfig;

    if (error) {
        loggers.Core.error(error.message || 'Ошибка конфигурирования .env', {meta: {name: error.name}, stack: error.stack});
        process.exit(-2);
    }

    loggers.Core.info(parsed);
}
