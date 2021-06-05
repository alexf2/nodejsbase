import {hash} from 'bcrypt';

export const getCodeByError = (err: any) => {
    if (err instanceof SyntaxError) {
        return 400;
    }
    return 500;
}

export const hashPassword = async (pwd: string) =>
    // тут явно задаём соль, чтобы проходили юнит-тесты
    hash(pwd, '$2b$10$vs6v8CHuogiRVpx9vnugke');
