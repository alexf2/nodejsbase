import {Converter} from 'csvtojson/v2/Converter';
import * as fs from 'fs';
import {Config, getOutFilePath} from './helpers';
import {Factory} from './mentoring.types';

/**
 * Конвертация с построчным чтением CSV-файла.
 */
export const mainCustomLineStream = (
    inputFactory: Factory<fs.ReadStream>,
    converterFactory: Factory<Converter>,
    outFactory: Factory<fs.WriteStream>,
) => {
    const csvPath = Config.task2FilePath;
    const jsonPath = getOutFilePath(csvPath);
    let line = '';

    const inputStream = inputFactory(csvPath, 1) // задаём размер буффера потока 1 байт и читаем CSV побайтно, накапливая только одну строку
        .on('readable', () => {
            const data = inputStream.read();
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

    const converter = converterFactory().on('done', err => {
        if (err) {
            cleanUp(`Ошибка конвертации ${csvPath}`, err);
        } else {
            cleanUp(`Конвертация завершена. Результат: ${jsonPath}`);
        }
    });
    const outStream = outFactory(getOutFilePath(csvPath))
        .on('error', err => {
            cleanUp(`Ошибка записи ${csvPath}`, err);
        });
      
        
    const writeLine = (isFinal?: boolean) => {
        if (!line) {
            if (isFinal) {
                converter.end();
            }
            return;
        }

        converter.isPaused() && converter.resume();

        if (converter?.write(line, undefined, () => isFinal && converter.end())) {
            line = '';
        } else {
            inputStream.pause();
            converter.once('drain', () => writeLine(isFinal));
        }
    }

    const cleanUp = (msg?: string, err?: any) => {
        msg && console.log(msg);
        err && console.log(err);

        inputStream?.destroy();
        err && outStream?.destroy();
    };

    converter.pipe(outStream);
}

// Пример трансформера: https://codingpajamas.github.io/2015/04/26/nodejs-transform-stream
// https://github.com/T-PWK/node-line-reader/blob/master/lib/transformer.js
// https://strongloop.com/strongblog/practical-examples-of-the-new-node-js-streams-api/
// https://stackoverflow.com/questions/52391773/properly-extend-stream-transform-class-with-typescript

