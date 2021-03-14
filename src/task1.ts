import * as readline from 'readline';

const main = () => {
    const input = process.stdin;
    const output = process.stdout;
    const rl = readline.createInterface({input, output, terminal: false, prompt: '?>'});

    console.log('Введите строку для реверса:\nДля завершения нажмите Ctrl+C\n\n');
    rl.prompt();

    rl.on('line', line => {
        if (line) {
            console.log(`${[...line].reverse().join('')}\r\n`);
        }
        rl.prompt();
    }).on('close', () => {
        process.exit(0);
    });
    
    process.on('SIGINT', () => {
        rl.close();
        input.destroy();
    })
}


main();

// https://stackoverflow.com/questions/20086849/how-to-read-from-stdin-line-by-line-in-node
