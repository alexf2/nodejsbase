/**
 * Logger for backend
 */
import * as W from 'winston';
import 'winston-daily-rotate-file';
import {Config} from './Config';

export type Logger = W.Logger;

// TODO: проверить, будет ли работать с PM2
const COMMON_LOG_FILE_NAME = './logs/common.log';
const TIME_FORMAT = 'HH:mm:ss SSS';
const {combine, timestamp, prettyPrint, colorize, json, simple, printf} = W.format;

// eslint-disable-next-line @typescript-eslint/no-shadow
const customFormatter = printf(({message, level, timestamp, component, meta, stack}) => {
    let layout = `${timestamp} [${component}] ${level}: ${message}`;
    if (meta) {
        layout += `\r\n\tMeta: ${JSON.stringify(meta)}`;
    }
    if (stack) {
        layout += `\r\n${stack}`;
    }
    return layout;
});

// https://www.datadoghq.com/blog/node-logging-best-practices/
class LoggersManager {
    private isCreated = false;
    private coreLogger: W.Logger | undefined;
    private memoryUserServiceLogger: W.Logger | undefined;
    private prismaUserServiceLogger: W.Logger | undefined;
    private prismaGroupServiceLogger: W.Logger | undefined;
    private prismaAuthServiceLogger: W.Logger | undefined;
    private module5CallInfoLogger: W.Logger | undefined;

    private readonly create = () => {
        if (!this.isCreated) {
            const level = Config.logLevel;
            const format = Config.logFormat;
            const transport = Config.logTransport;
            const logSink = transport === 'Console' ?
                new (W.transports.Console)()
                :
                new (W.transports.DailyRotateFile)({
                    datePattern: 'DD-MM-YYYY',
                    filename: COMMON_LOG_FILE_NAME,
                });

            this.isCreated = true;

            const baseConfig = {
                level,
                format: combine(
                    ...([
                        timestamp({format: TIME_FORMAT}),
                        // label({label: 'm_service'}), // добавляется рядом с message
                        prettyPrint(),
                        transport === 'Console' ? colorize() : undefined,
                        format === 'Simple' ? simple() : json(),
                        customFormatter,
                    ].filter(Boolean) as W.Logform.Format[]),
                ),
                transports: [logSink],
            };

            this.coreLogger = W.createLogger({
                defaultMeta: {component: 'CORE'},
                ...baseConfig,
                // Мод. 5: обработку необработанных исключений выносим
                /*exitOnError: true,
                exceptionHandlers: [logSink],*/
            });

            this.memoryUserServiceLogger = W.createLogger({
                defaultMeta: {component: 'MEM_USER_SERVICE'},
                ...baseConfig,
            });

            this.prismaUserServiceLogger = W.createLogger({
                defaultMeta: {component: 'PRISMA_USER_SERVICE'},
                ...baseConfig,
            });

            this.prismaAuthServiceLogger = W.createLogger({
                defaultMeta: {component: 'PRISMA_AUTH_SERVICE'},
                ...baseConfig,
            });

            this.prismaGroupServiceLogger = W.createLogger({
                defaultMeta: {component: 'PRISMA_GROUP_SERVICE'},
                ...baseConfig,
            });

            this.module5CallInfoLogger = W.createLogger({
                defaultMeta: {component: 'MOD5_CALL_INFO'},
                ...baseConfig,
            });
        }
    }

    public get Core() {
        this.create();
        return this.coreLogger!;
    }

    public get MemoryUserService() {
        this.create();
        return this.memoryUserServiceLogger!;
    }

    public get PrismaUserService() {
        this.create();
        return this.prismaUserServiceLogger!;
    }

    public get PrismaGroupService() {
        this.create();
        return this.prismaGroupServiceLogger!;
    }

    public get PrismaAuthService() {
        this.create();
        return this.prismaAuthServiceLogger!;
    }

    public get Mod5CallInfo() {
        this.create();
        return this.module5CallInfoLogger!;
    }
}

export const loggers = new LoggersManager();
