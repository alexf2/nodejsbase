import * as http from 'http';
// import {URLSearchParams} from 'url';
import express, {Application, Request, Response, NextFunction} from 'express';
import {requestId} from './middleware';
import {UserStorage} from './DAL/UserStorage';
import {UserController} from './controllers';
import {Config, loggers, Logger} from './helpers';
import {testUsers} from './part2_testData';
import {User} from './DAL/models';


class SimpleExpressServer {
    private storage?: UserStorage;
    private httpServer?: http.Server;
    private isShuttingdown = false;

    constructor(
        private ip: string,
        private port: number,
        private logger: Logger,
        private app: Application = express()) {

        // решил использовать joi-express, а он умеет разбирать параметры querystring и кастить их типы по схеме,
        // поэтому этот парсер уже не нужен
        // app.set('query parser', queryString => new URLSearchParams(queryString));

        this.logger.info('Server is being initialized...');
    }

    private readonly initDb = async () => await Promise.resolve(new UserStorage(testUsers as User[]));

    public readonly run = async () => {
        this.logger.info('Server is about to run');

        // инициализация и конфигурирование сервера
        this.storage = await this.initDb();
        this.addGlobalMiddlewares();
        this.addControllers();

        // запуск сервера
        this.httpServer = this.app.listen(
            this.port,
            this.ip,
            () => this.logger.info(`Server listens ${this.ip}:${this.port}`),
        );
        process.on('SIGINT', this.cleanup);
        process.on('SIGTERM', this.cleanup);
    }

    private readonly cleanup = () => {
        this.isShuttingdown = true;

        const timeout = setTimeout(() => {
            this.logger.warn('Couldn\'t close Express connections on time, forcing shut down');
            process.exit(1);
        }, 30000).unref();

        this.httpServer?.close(() => {
            clearTimeout(timeout);
            this.storage?.clear();
            this.logger.info('Express server with connections closed gracefully.');
            process.exit();
        });
    }

    private readonly restartingMiddleware = (req: Request, res: Response, next: NextFunction) => {
        if (this.isShuttingdown) {
            res.setHeader('Connection', 'close');
            res.status(503).send('Server is in the process of restarting');
        }
        else {
            next();
        }
    }

    private readonly addGlobalMiddlewares = () => {
        this.app.use(requestId, this.restartingMiddleware, express.json());
    }

    private readonly addControllers = () => {
        new UserController(loggers.RestService, this.storage!).install(this.app);
    }
}

new SimpleExpressServer(Config.ip, Config.port, loggers.Core).run();

// https://dev.to/thedenisnikulin/express-js-on-steroids-an-oop-way-for-organizing-node-js-project-starring-typescript-388p
// https://github.com/davidkpiano/node-azure-mvc
// Gracefull server closing: https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
