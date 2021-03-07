import csvtojson from 'csvtojson';
import {Converter} from 'csvtojson/v2/Converter';
import * as fs from 'fs';
import * as path from 'path';
import {Config} from './config';
const BUFFER_SIZE = 1024;

type Opt<T> = T | undefined;

const getOutFilePath = filePath => {
    const {ext, base, ...rest} = path.parse(filePath);
    return path.format({...rest, ext: '.json'});
};

const main = () => {
    const csvPath = Config.task2FilePath;
    const jsonPath = getOutFilePath(csvPath);
    let inputStream: Opt<fs.ReadStream>;
    let outStream: Opt<fs.WriteStream>;
    let converter: Opt<Converter>;

    const cleanUp = (msg?: string, err?: any) => {
        msg && console.log(msg);
        err && console.log(err);

        inputStream?.destroy(), inputStream = undefined;
        converter?.end(), converter = undefined;
        err && (outStream?.destroy(), outStream = undefined);
    };

    converter = csvtojson(
        {
            trim: true,
            delimiter: Config.csvDelimiter,
            downstreamFormat: 'array',
        },
        {highWaterMark: BUFFER_SIZE},
    ).on('done', err => {
        if (err) {
            cleanUp(`Ошибка конвертации ${csvPath}`, err);
        } else {
            cleanUp(`Конвертация завершена. Результат: ${jsonPath}`);
        }
    });

    inputStream = fs.createReadStream(csvPath, {highWaterMark: BUFFER_SIZE, encoding: Config.inputEncoding});
    inputStream.on('error', err => {
        cleanUp(`Ошибка чтения ${csvPath}`, err);
    });

    /* w - усечь, если файл существует */
    outStream = fs.createWriteStream(
        getOutFilePath(csvPath),
        {
            highWaterMark: BUFFER_SIZE,
            encoding: Config.outEncoding,
            flags: 'w',
        },
    ); 
    outStream.on('error', err => {
        cleanUp(`Ошибка записи ${csvPath}`, err);
    });

    inputStream.pipe(converter).pipe(outStream);
}

main();
