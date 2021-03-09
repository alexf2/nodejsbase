import {Converter} from 'csvtojson/v2/Converter';
import * as fs from 'fs';
import * as path from 'path';
import {Config} from './helpers';
import {initilaizeConfig} from './appConfig';
import {csvStreamFactory, csv2jsonFactory, jsonStreamFactory} from './task1BufferedStreams';

type Opt<T> = T | undefined;
type Factory<T> = (...a: any[]) => T;

const getOutFilePath = filePath => {
    const {ext, base, ...rest} = path.parse(filePath);
    return path.format({...rest, ext: '.json'});
};

const mainBufferedStream = (
    inputFactory: Factory<fs.ReadStream>,
    converterFactory: Factory<Converter>,
    outFactory: Factory<fs.WriteStream>,
) => {
    initilaizeConfig(); // инициализируем конфигурацию

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

    inputStream = inputFactory(csvPath);
    inputStream.on('error', err => {
        cleanUp(`Ошибка чтения ${csvPath}`, err);
    });

    outStream = outFactory(getOutFilePath(csvPath));
    outStream.on('error', err => {
        cleanUp(`Ошибка записи ${csvPath}`, err);
    });

    inputStream.pipe(converter).pipe(outStream);
}

mainBufferedStream(csvStreamFactory, csv2jsonFactory, jsonStreamFactory);
