import {Request, Response, Router} from 'express';
import {Logger} from '../helpers';
import {IStorage} from '../DAL';
import {User} from '../DAL/models';
import {ControllerBase} from './ControllerBase';

const BASE_URL = '/api';

export class UserController extends ControllerBase {
    constructor(logger: Logger, private db: IStorage<User, string>) {
        super(BASE_URL, logger);
    }

    public readonly getAll = (req: Request, res: Response) => {
        this.logger.debug('getAll called');

        const users = this.db.getAll();
        if (!users || !users.length) {
            res.status(204);
        }
        res.json(users);
    }

    public readonly getById = (req: Request, res: Response) => {
        this.logger.debug('getById called');

        const {id} = req.params;
        const user = this.db.getById(id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).send(`User with id ${id} is not found`);
        }
    }

    public readonly create = (req: Request, res: Response) => {
        this.logger.debug('create called');

        const user = this.db.create(req.body);
        res.status(201).json(user);
    }

    public readonly update = (req: Request, res: Response) => {
        this.logger.debug('update called');

        const {id} = req.params;
        const user = this.db.update(id, req.body);
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).send(`User with id ${id} is not found`);
        }
    }

    public readonly delete = (req: Request, res: Response) => {
        this.logger.debug('delete called');

        const {id} = req.params;
        const user = this.db.delete(id);
        if (user) {
            res.send();
        }
        else {
            res.status(404).send(`User with id ${id} is not found`);
        }
    }

    public readonly getSuggest = (req: Request, res: Response) => {
        this.logger.debug('getSuggest called');

        throw new Error('Not implemented');
    }

    protected readonly installRoutes = (router: Router) => {
        router
            .get('/users', this.getAll)
            .get('/user/:id', this.getById)
            .post('/user', this.create)
            .put('/user/:id', this.update)
            .delete('/user/:id', this.delete)
            .get('/user/suggest', this.getSuggest);

        this.logger.debug(`Route GET ${super.makePath('users')} added`);
        this.logger.debug(`Route GET ${super.makePath('user/:id')} added`);
        this.logger.debug(`Route POST ${super.makePath('user')} added`);
        this.logger.debug(`Route PUT ${super.makePath('user/:id')} added`);
        this.logger.debug(`Route DEL ${super.makePath('user/:id')} added`);
        this.logger.debug(`Route GET ${super.makePath('user/suggest')} added`);
    }
}
