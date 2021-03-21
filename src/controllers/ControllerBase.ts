import {Application, Router} from 'express';
import {IController} from './controllers.types';
import {Logger} from '../helpers';
import {catchError} from '../middleware';

export abstract class ControllerBase implements IController {
    protected router?: Router;
    protected installed = false;

    constructor(protected basePath: string, protected logger: Logger) {
    }

    public readonly install = (expressApp: Application) => {
        if (!this.installed) {
            this.router = Router();

            this.installLocalMiddlewares(this.router);
            this.installRoutes(this.router);
            // устанавливаем обработчик ошибок после всех методов контроллера, чтобы он ловил next(err), вызванное в них
            this.router.use(catchError(this.logger));

            // регистрируем роутер в нашем сервере
            expressApp.use(this.basePath, this.router);
            this.installed = true;
        }
    }

    public get isInstalled() {
        return this.installed;
    }

    protected readonly installLocalMiddlewares = (r: Router) => {}

    protected abstract readonly installRoutes: (r: Router) => void;

    protected readonly makePath = (segment: string) => this.basePath + '/' + segment;
}
