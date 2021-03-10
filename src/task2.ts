import {Converter} from 'csvtojson/v2/Converter';
import * as fs from 'fs';
import {Config, getOutFilePath} from './helpers';
import {initilaizeConfig} from './appConfig';
import {csvStreamFactory, csv2jsonFactory, jsonStreamFactory} from './task2_StreamFactories';

type Opt<T> = T | undefined;
type Factory<T> = (...a: any[]) => T;

/**
 * Конвертация с построчным чтением CSV-файла.
 */
const mainCustomLineStream = (
    inputFactory: Factory<fs.ReadStream>,
    converterFactory: Factory<Converter>,
    outFactory: Factory<fs.WriteStream>,
) => {
    const csvPath = Config.task2FilePath;
    const jsonPath = getOutFilePath(csvPath);
    let inputStream: Opt<fs.ReadStream> = undefined;
    let outStream: Opt<fs.WriteStream> = undefined;
    let converter: Opt<Converter> = undefined;
    let line = '';


    const cleanUp = (msg?: string, err?: any) => {
        msg && console.log(msg);
        err && console.log(err);

        inputStream?.destroy();
        err && outStream?.destroy();
    };


    const writeLine = (isFinal?: boolean) => {
        if (!line) {
            if (isFinal) {
                converter!.end();
            }
            return;
        }

        converter!.isPaused() && converter!.resume();

        if (converter?.write(line, undefined, () => isFinal && converter!.end())) {
            line = '';
        } else {
            inputStream!.pause();
            converter!.once('drain', () => writeLine(isFinal));
        }
    }

    inputStream = inputFactory(csvPath, 1) // задаём размер буффера потока 1 байт и читаем CSV побайтно, накапливая только одну строку
        .on('readable', () => {
            const data = inputStream!.read();
            if (data) {
                const char = data.toString();
                line += char;
                if (char === '\n') {
                    writeLine();
                }
            }
        })
        .on('end', () => {
            writeLine(true);
        })
        .on('error', err => {
            cleanUp(`Ошибка чтения ${csvPath}`, err);
        });

    converter = converterFactory().on('done', err => {
        if (err) {
            cleanUp(`Ошибка конвертации ${csvPath}`, err);
        } else {
            cleanUp(`Конвертация завершена. Результат: ${jsonPath}`);
        }
    });
    outStream = outFactory(getOutFilePath(csvPath))
        .on('error', err => {
            cleanUp(`Ошибка записи ${csvPath}`, err);
        });

    converter.pipe(outStream);
}

/**
 * Конвертация с чтением CSV через фиксированный буффер.
 */
const mainBufferedStream = (
    inputFactory: Factory<fs.ReadStream>,
    converterFactory: Factory<Converter>,
    outFactory: Factory<fs.WriteStream>,
) => {
    const csvPath = Config.task2FilePath;
    const jsonPath = getOutFilePath(csvPath);
    let inputStream: Opt<fs.ReadStream> = undefined;
    let outStream: Opt<fs.WriteStream> = undefined;
    let converter: Opt<Converter> = undefined;


    const cleanUp = (msg?: string, err?: any) => {
        msg && console.log(msg);
        err && console.log(err);

        inputStream?.destroy();
        err && outStream?.destroy();
    };

    converter = converterFactory().on('done', err => {
        if (err) {
            cleanUp(`Ошибка конвертации ${csvPath}`, err);
        } else {
            cleanUp(`Конвертация завершена. Результат: ${jsonPath}`);
        }
    });


    inputStream = inputFactory(csvPath)
        .on('error', err => {
            cleanUp(`Ошибка чтения ${csvPath}`, err);
        });

    outStream = outFactory(getOutFilePath(csvPath))
        .on('error', err => {
            cleanUp(`Ошибка записи ${csvPath}`, err);
        });

    inputStream.pipe(converter).pipe(outStream);
}

initilaizeConfig(); // инициализируем конфигурацию
// mainBufferedStream(csvStreamFactory, csv2jsonFactory, jsonStreamFactory);
mainCustomLineStream(csvStreamFactory, csv2jsonFactory, jsonStreamFactory);

// Пример трансформера: https://codingpajamas.github.io/2015/04/26/nodejs-transform-stream
// https://github.com/T-PWK/node-line-reader/blob/master/lib/transformer.js
// https://strongloop.com/strongblog/practical-examples-of-the-new-node-js-streams-api/
// https://stackoverflow.com/questions/52391773/properly-extend-stream-transform-class-with-typescript

