export enum EnvType {
    Dev = 'development',
    Test = 'test',
    Prod = 'production',
}

export namespace Env {
    export const isDevelopment = () => (process.env.NODE_ENV || EnvType.Dev) === EnvType.Dev;

    export const isProduction = () => process.env.NODE_ENV === EnvType.Prod;

    export const isTest = () => process.env.NODE_ENV === EnvType.Test;
}
