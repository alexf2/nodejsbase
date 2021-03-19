import {URLSearchParams} from 'url';
import {Request, Response, Router} from 'express';
import {Logger} from '../helpers';
import {ControllerBase} from './ControllerBase';
import {IUserStorage} from '../DAL/dal.types';

const BASE_URL = '/api';

export class UserController extends ControllerBase {
    constructor(logger: Logger, private db: IUserStorage) {
        super(BASE_URL, logger);
    }

    public readonly getAll = (req: Request, res: Response) => {
        this.logger.debug('getAll called');
        const query = req.query as any as URLSearchParams;

        const users = this.db.getAll(parseInt(query.get('limit')!));
        if (!users || !users.length) {
            res.status(204);
        }
        res.json(users);
    }

    public readonly getCount = (req: Request, res: Response) => {
        this.logger.debug('getCount called');

        const count = this.db.count();
        res.json(count);
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

    public readonly getSuggests = (req: Request, res: Response) => {
        this.logger.debug('getSuggest called');
        const query = req.query as any as URLSearchParams;
        
        const users = this.db.getSuggests(query.get('login'), parseInt(query.get('limit')!));
        if (!users || !users.length) {
            res.status(204);
        }
        res.json(users);
    }

    protected readonly installRoutes = (router: Router) => {
        router
            .get('/users', this.getAll)
            .get('/users/count', this.getCount)
            .get('/user/:id', this.getById)
            .post('/user', this.create)
            .put('/user/:id', this.update)
            .delete('/user/:id', this.delete)
            .get('/user/suggest', this.getSuggests);

        this.logger.debug(`Route GET ${this.makePath('users')} added`);
        this.logger.debug(`Route GET ${this.makePath('users/count')} added`);
        this.logger.debug(`Route GET ${this.makePath('user/:id')} added`);
        this.logger.debug(`Route POST ${this.makePath('user')} added`);
        this.logger.debug(`Route PUT ${this.makePath('user/:id')} added`);
        this.logger.debug(`Route DEL ${this.makePath('user/:id')} added`);
        this.logger.debug(`Route GET ${this.makePath('user/suggest')} added`);
    }
}
