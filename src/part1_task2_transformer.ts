import {Converter} from 'csvtojson/v2/Converter';
import * as fs from 'fs';
import {pipeline, Transform, TransformOptions, TransformCallback} from 'stream';
import {StringDecoder} from 'string_decoder';
import {Config, getOutFilePath} from './helpers';
import {Factory} from './mentoring.types';

const exLineEnd = /\r?\n/;

class LineTransform extends Transform {
    private readonly decoder: StringDecoder;
    private lineAcc = '';
    private lineCount = 0;

    constructor (opt?: TransformOptions) {
        super({...opt, readableObjectMode: false, writableObjectMode: true});
        this.decoder = new StringDecoder(opt && opt.defaultEncoding || 'utf8');
    };

    private readonly transformLine = (line: string) => {
        const prefix = this.lineCount === 0 ? 'Order' : this.lineCount.toString();
        line && this.lineCount++;
        return line ? `${prefix};${line}\r\n` : line;
    }

    public _transform (chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
        if ((encoding as any) === 'buffer' || chunk instanceof Buffer) {
            this.lineAcc += this.decoder.write(chunk);
        } else {
            this.lineAcc += chunk.toString(encoding);
        }

        const lines = this.lineAcc.split(exLineEnd);
        this.lineAcc = lines.pop() || '';
        lines.forEach(line => this.push(this.transformLine(line)));

        callback();
    }

    public _flush (callback: TransformCallback) {
        // могут быть разрывы входного потока на многобайтовых символах:
        // decoder такие последовательности накапливает
        this.lineAcc += this.decoder.end();

        if (this.lineAcc) {
            callback(null, this.lineAcc.trim());
            this.lineAcc = '';
        } else {
            callback();
        }
    }
};

/**
 * Конвертация с построчным чтением CSV-файла при помощи трансформера.
 */
export const mainTransformerLineStream = (
    inputFactory: Factory<fs.ReadStream>,
    converterFactory: Factory<Converter>,
    outFactory: Factory<fs.WriteStream>,
) => {
    const csvPath = Config.task2FilePath;
    const jsonPath = getOutFilePath(csvPath);

    const inputStream = inputFactory(csvPath);
    const lineTransform = new LineTransform({
        defaultEncoding: inputStream.readableEncoding || undefined,
    });
    const converter = converterFactory().on('done', err => {
        if (err) {
            console.log(`Ошибка конвертации ${csvPath}`);
            console.log(err);
        } else {
            console.log(`Конвертация завершена. Результат: ${jsonPath}`);
        }
    });
    const outStream = outFactory(getOutFilePath(csvPath))
        .on('finish', () => console.log('Запись завершена'));

    pipeline(
        inputStream,
        lineTransform,
        converter,
        outStream,
        err => {
            if (err) {
                console.log('Main error');
                console.log(err);
            } else {
                console.log('Finished OK');
            }
        },
    );
}
