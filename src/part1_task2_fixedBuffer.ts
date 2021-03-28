import {Converter} from 'csvtojson/v2/Converter';
import * as fs from 'fs';
import {Config, getOutFilePath} from './helpers';
import {Factory} from './mentoring.types';

/**
 * Конвертация с чтением CSV через фиксированный буффер.
 */
export const mainBufferedStream = (
    inputFactory: Factory<fs.ReadStream>,
    converterFactory: Factory<Converter>,
    outFactory: Factory<fs.WriteStream>,
) => {
    const csvPath = Config.task2FilePath;
    const jsonPath = getOutFilePath(csvPath);

    const converter = converterFactory().on('done', err => {
        if (err) {
            cleanUp(`Ошибка конвертации ${csvPath}`, err);
        } else {
            cleanUp(`Конвертация завершена. Результат: ${jsonPath}`);
        }
    });


    const inputStream = inputFactory(csvPath)
        .on('error', err => {
            cleanUp(`Ошибка чтения ${csvPath}`, err);
        });

    const outStream = outFactory(getOutFilePath(csvPath))
        .on('error', err => {
            cleanUp(`Ошибка записи ${csvPath}`, err);
        });

    const cleanUp = (msg?: string, err?: any) => {
        msg && console.log(msg);
        err && console.log(err);

        inputStream?.destroy();
        err && outStream?.destroy();
    };

    inputStream.pipe(converter).pipe(outStream)
        .on('finish', () => console.log('Запись завершена'));
}

