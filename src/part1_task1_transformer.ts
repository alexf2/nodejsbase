import {pipeline, Transform, TransformOptions, TransformCallback} from 'stream';
import {StringDecoder} from 'string_decoder';

const exLineEnd = /(\r?\n)|(\n?\r)/;

class ReverseStringTransform extends Transform {
    private readonly decoder: StringDecoder;
    private lineAcc = '';

    constructor (opt?: TransformOptions) {
        super({...opt, readableObjectMode: false, writableObjectMode: true});
        this.decoder = new StringDecoder(opt && opt.defaultEncoding || 'utf8');
    };

    public _transform (chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
        let nextChar: string;

        if ((encoding as any) === 'buffer' || chunk instanceof Buffer) {
            nextChar = this.decoder.write(chunk);
        } else {
            nextChar = chunk.toString(encoding);
        }
        this.lineAcc += nextChar;

        if (exLineEnd.test(this.lineAcc)) {
            const lines = this.lineAcc.split(exLineEnd);
            this.lineAcc = lines.length === 1 ? '' : lines.pop()!;

            callback(null, `\r\n${[...lines[0]].reverse().join('')}\r\n>`);
        } else {
            if (this.lineAcc === '\u0003') {
                process.exit();
            }

            callback(null, nextChar);
        }
    }

    public _flush (callback: TransformCallback) {
        // могут быть разрывы входного потока на многобайтовых символах:
        // decoder такие последовательности накапливает
        this.lineAcc += this.decoder.end();

        if (this.lineAcc) {
            callback(null, `\r\n${[...this.lineAcc].reverse().join('')}\r\n>`);
            this.lineAcc = '';
        } else {
            callback();
        }
    }
};

/**
 * Реализация на основе собственного трансформера.
 */
const main = () => {
    process.stdin.setRawMode(true);
    process.stdin.resume();

    console.log('Press Ctrl+C to exit');
    process.stdout.write('>');

    pipeline(
        process.stdin,
        new ReverseStringTransform(),
        process.stdout,
        err => {
            if (err) {
                console.log(err);
            } else {
                console.log('Finished OK');
            }
        },
    );
}

main();
