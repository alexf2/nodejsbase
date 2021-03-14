import {mainCustomLineStream} from './task2_customDirectRead';
import {mainBufferedStream} from './task2_fixedBuffer';
import {csvStreamFactory, csv2jsonFactory, jsonStreamFactory} from './helpers/streamFactories_task2';

enum ImplementationVer {
    FixedBuffer = 'fixed',
    CustomDirectReader = 'direct-read',
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

            default:
                console.error(`Неправильный аргумент командной строки: ${args[0]}.
                    Доступно ${Object.keys(ImplementationVer).map(k => ImplementationVer[k]).join(', ')}.`);
                process.exit(-1);
        }
    }
}

main();