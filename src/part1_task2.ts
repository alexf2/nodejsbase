import {mainCustomLineStream} from './part1_task2_customDirectRead';
import {mainBufferedStream} from './part1_task2_fixedBuffer';
import {mainTransformerLineStream} from './part1_task2_transformer';
import {csvStreamFactory, csv2jsonFactory, jsonStreamFactory} from './helpers/streamFactories_task2';

enum ImplementationVer {
    FixedBuffer = 'fixed',
    CustomDirectReader = 'direct-read',
    Transformer = 'transformer',
}

const main = () => {
    const args = process.argv.slice(2);
    if (args.length) {
        switch (args[0].trim().toLocaleLowerCase()) {
            case ImplementationVer.FixedBuffer:
                console.log('Используется фиксированный буфер');
                mainBufferedStream(csvStreamFactory, csv2jsonFactory, jsonStreamFactory);
                break;

            case ImplementationVer.CustomDirectReader:
                console.log('Используется прямое чтение');
                mainCustomLineStream(csvStreamFactory, csv2jsonFactory, jsonStreamFactory);
                break;

            case ImplementationVer.Transformer:
                console.log('Используется собственный трансформер');
                mainTransformerLineStream(csvStreamFactory, csv2jsonFactory, jsonStreamFactory);
                break;

            default:
                console.error(`Неправильный аргумент командной строки: ${args[0]}.
                    Доступно ${Object.keys(ImplementationVer).map(k => ImplementationVer[k]).join(', ')}.`);
                process.exit(-1);
        }
    }
}

main();
