import * as http from 'http';
import helmet from 'helmet';
import nocache from 'nocache';
import cors from 'cors';
// import {URLSearchParams} from 'url';
import express, {Application, Request, Response, NextFunction} from 'express';
import {
    requestId,
    route404Handler,
    getBadRequestErrorHandler,
    getRequestInfo,
    getUnhandledErrorHandler,
    getUnhandledRejectionHandler,
    getAuthMiddleware,
} from './middleware';
import {UserController, GroupController, AuthenticationController, FULL_LOGIN_ROUTE} from './controllers';
import {initializeDotEnvConfiguration, Config, loggers, Logger, repositoryFactory} from './helpers';
import {UserService, GroupService, IUserService, IGroupService} from './services';
import {IUserRepository, IGroupRepository} from './DAL';

initializeDotEnvConfiguration();

/**
 * Composition root REST сервера.
 * Пока общий для всех модулей менторинга.
 */
class SimpleExpressServer {
    private userRepository?: IUserRepository;
    private groupRepository?: IGroupRepository;
    private userService?: IUserService;
    private groupService?: IGroupService;
    private userLogger?: Logger; // логгер для UserService
    private groupLogger?: Logger; // логгер для GroupService
    private module5CallInfoLogger?: Logger; // логгер для отображения информации о вызове REST API
    private authLogger?: Logger;
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
        this.logger.info('Repository is being opened...');
        const repositories = await repositoryFactory();

        for (const repoField of Object.keys(repositories.repo)) {
            await repositories.repo[repoField].open();
        }
        this.logger.info('Repository opened OK');

        return repositories;
    }

    // тут находится Composition Root
    public readonly run = async () => {
        this.logger.info('Server is about to run');

        // инициализация и конфигурирование сервера
        const {repo: {userRepo, groupRepo}, logger: {userLogger, groupLogger, authLogger}} = await this.initDb();
        this.userRepository = userRepo;
        this.groupRepository = groupRepo;
        this.userService = new UserService(this.userLogger!, userRepo);
        this.groupService = new GroupService(this.groupLogger!, groupRepo);
        this.userLogger = userLogger;
        this.groupLogger = groupLogger;
        this.authLogger = authLogger;
        this.module5CallInfoLogger = loggers.Mod5CallInfo;

        this.addGlobalPreMiddlewares();
        this.addControllers();
        this.addGlobalPostMiddlewares();
        this.addProcessErrorHandlers();

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
            await this.userRepository?.destroy();
            await this.groupRepository?.destroy();
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

    /**
     * Добавляет middleware, которое должно обработать запрос до конмтроллеров.
     */
    private readonly addGlobalPreMiddlewares = () => {
        this.app.use(
            helmet.hidePoweredBy(),
            helmet.xssFilter(),
            helmet.referrerPolicy(),
            helmet.frameguard(),
            helmet.dnsPrefetchControl(),
            nocache(),
        );
        this.app.use(
            requestId,
            this.restartingMiddleware,
            getAuthMiddleware(this.userService!, this.authLogger!, FULL_LOGIN_ROUTE),
            cors(),
            express.json(),
        );
        // логирование запросов к REST-сервисам (модуль 5)
        this.app.all('/*', getRequestInfo(this.module5CallInfoLogger!));
    }

    /**
     * Добавляет middleware, которое должно обработать запрос после конмтроллеров.
     */
    private readonly addGlobalPostMiddlewares = () => {
        this.app.use(route404Handler, getBadRequestErrorHandler(this.logger));
    }

    // добавляется после GlobalMiddlewares
    private readonly addControllers = () => {
        new UserController(this.userLogger!, this.userService!).install(this.app);
        new GroupController(this.groupLogger!, this.groupService!).install(this.app);
        new AuthenticationController(this.authLogger!, this.userService!).install(this.app);
    }

    // Мод. 5.2.
    // Вместо src\helpers\loggers.ts
    // exitOnError: true,
    // exceptionHandlers: [logSink],
    // Обрабатывать можно либо тут, либо там.
    private readonly addProcessErrorHandlers = () => {
        process.on('uncaughtException', getUnhandledErrorHandler(this.logger));
        process.on('unhandledRejection', getUnhandledRejectionHandler(this.logger));
    }
}

new SimpleExpressServer(Config.ip, Config.port, loggers.Core).run();

// https://dev.to/thedenisnikulin/express-js-on-steroids-an-oop-way-for-organizing-node-js-project-starring-typescript-388p
// https://github.com/davidkpiano/node-azure-mvc
// Gracefull server closing: https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
