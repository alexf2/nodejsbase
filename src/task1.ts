import * as readline from 'readline';

const main = () => {
    const input = process.stdin;
    const output = process.stdout;

    const rl = readline.createInterface({input, output, terminal: true, prompt: '?>'});
    rl.write('Введите строку для реверса:\nДля завершения нажмите Ctrl+C\n\n');
    rl.prompt();

    rl.on('line', line => {
        if (line) {
            console.log([...line].reverse().join(''));
            console.log();
            // rl.write([...line].reverse().join(''));
        }
        rl.prompt();
    })
    .on('SIGINT', () => {
        console.log('!!! closing');
        rl.close();
        input.destroy();
    })
    .on('close', () => {
        console.log('!!! closing2');
        process.exit(0);
    });
}


main();

// https://stackoverflow.com/questions/20086849/how-to-read-from-stdin-line-by-line-in-node