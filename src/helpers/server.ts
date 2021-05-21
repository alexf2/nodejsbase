import {hash} from 'bcrypt';

export const getCodeByError = (err: any) => {
    if (err instanceof SyntaxError) {
        return 400;
    }
    return 500;
}

export const hashPassword = async (pwd: string) => hash(pwd, Math.random());
