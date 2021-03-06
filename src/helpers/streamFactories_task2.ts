import * as fs from 'fs';
import csvtojson from 'csvtojson';
import {Config} from '.';

const BUFFER_SIZE = 1024;

export const csvStreamFactory = (path: string, bufferSize: number = BUFFER_SIZE) =>
    fs.createReadStream(path, {highWaterMark: bufferSize, encoding: Config.inputEncoding});

export const csv2jsonFactory = () => csvtojson(
    {
        trim: true,
        delimiter: Config.csvDelimiter,
        downstreamFormat: 'array',

    },
    {highWaterMark: BUFFER_SIZE},
);

export const jsonStreamFactory = (path: string) => fs.createWriteStream(
    path,
    {
        highWaterMark: BUFFER_SIZE,
        encoding: Config.outEncoding,
        flags: 'w', /* w - усечь, если файл существует */
    },
);
