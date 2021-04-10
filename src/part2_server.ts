import * as http from 'http';
// import {URLSearchParams} from 'url';
import express, {Application, Request, Response, NextFunction} from 'express';
import {requestId} from './middleware';
import {UserController} from './controllers';
import {initializeDotEnvConfiguration, Config, loggers, Logger, addRequestId, repositoryFactory} from './helpers';
import {UserService} from './services';
import {IUserRepository} from './DAL';

initializeDotEnvConfiguration();
class SimpleExpressServer {
    private repository?: IUserRepository;
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

    private readonly initDb = async () => {
        const repo = repositoryFactory();

        this.logger.info('Repository is being opened...');
        await repo.open();
        this.logger.info('Repository opened OK');

        return repo;
    }

    // тут находится Composition Root
    public readonly run = async () => {
        this.logger.info('Server is about to run');

        // инициализация и конфигурирование сервера
        this.repository = await this.initDb();
        this.addGlobalMiddlewares();
        this.addControllers();

        // запуск сервера
        this.httpServer = this.app.listen(
            this.port,
            this.ip,
            () => this.logger.info(`Server listens ${this.ip}:${this.port}`),
        );
        // обработчик на завершение процесса для корректной очистки ресурсов, закрытия коннекшенов
        process.on('SIGINT', this.cleanup);
        process.on('SIGTERM', this.cleanup);
    }

    private readonly cleanup = async () => {
        this.isShuttingdown = true;

        const timeout = setTimeout(() => {
            this.logger.warn('Couldn\'t close Express connections on time, forcing shut down');
            process.exit(1);
        }, 30000).unref();

        // тут надо закрыть входящие соединения клиентов к серверу
        this.httpServer?.close(async () => {
            clearTimeout(timeout);
            // закрываем репозиторий 
            await this.repository?.destroy();
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
        this.app.use(requestId, this.restartingMiddleware, express.json(), this.globalErrorHandler);
    }

    // добавляется после GlobalMiddlewares
    private readonly addControllers = () => {
        const userService = new UserService(loggers.RestService, this.repository!);
        new UserController(loggers.RestService, userService).install(this.app);
    }

    private readonly globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err) {
            const isParsingError = err instanceof SyntaxError; // тут ловим ошибки парсинга request json из express.json()
            const code = isParsingError ? 400 : 500;
            const name = isParsingError ? `RequestParsingError: ${err.name}` : `InternalServerError: ${err.name}`;

            this.logger.error(err.message || name, {meta: addRequestId(res, {name, code}), stack: err.stack});
            res.status(code).json({name, message: err.message});
        } else {
            next();
        }
    }
}

new SimpleExpressServer(Config.ip, Config.port, loggers.Core).run();

// https://dev.to/thedenisnikulin/express-js-on-steroids-an-oop-way-for-organizing-node-js-project-starring-typescript-388p
// https://github.com/davidkpiano/node-azure-mvc
// Gracefull server closing: https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
