// import {URLSearchParams} from 'url';
import {ValidatedRequest} from 'express-joi-validation';
import {NextFunction, Request, Response, Router} from 'express';
import {Logger, NotFoundError, getRequestIdMeta} from '../helpers';
import {ControllerBase} from './ControllerBase';
import {IUserService} from '../services';
import {
    userControllerValidator,
    bodyCreateUser,
    CreateUserBodySchema,
    UpdateUserBodySchema,
    qsSuggestsUser,
    SuggestsUserSchema,
} from './usercontroller.schemas';
import {
    GetAllQuerySchema,
    qsGetAll,
    paramGetById,
    GetByIdParamSchema,
} from './common.schemas';
import {BASE_URL} from './const';

export class UserController extends ControllerBase {
    constructor(logger: Logger, private userService: IUserService) {
        super(BASE_URL, logger);
    }

    /**
     * Возвращает всех пользователей.
     * @example GET api/users?limit=N
     * где N - число, ограничивающее resultset. По умолчанию N не определено и возвращается всё.
     */
    public readonly getAll = async (req: ValidatedRequest<GetAllQuerySchema>, res: Response, next: NextFunction) => {
        this.logger.debug('getAll called', getRequestIdMeta(res));

        try {
            const {query} = req;

            // const users = this.db.getAll(parseInt(query.get('limit')!)); //URLSearchParams
            const users = await this.userService.getAllUsers(query.limit);
            if (!users || !users.length) {
                res.status(204);
            }
            res.json(users);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Возвращает число пользователей.
     * @example GET api/users/count
     */
    public readonly getCount = async (req: Request, res: Response, next: NextFunction) => {
        this.logger.debug('getCount called', getRequestIdMeta(res));

        try {
            const count = await this.userService.countUsers();
            res.json(count);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Возвращает пользователя по его id.
     * @example GET api/user/:id
     */
    public readonly getById = async (req: ValidatedRequest<GetByIdParamSchema>, res: Response, next: NextFunction) => {
        this.logger.debug('getById called', getRequestIdMeta(res));

        try {
            const {id} = req.params;
            const user = await this.userService.getUserById(id);
            if (user) {
                res.json(user);
            } else {
                throw new NotFoundError('User', id);
            }
        } catch (err) {
            next(err);
        }
    }

    /**
     * Создаёт нового пользователя.
     * @example POST api/user
     * body: Partial<User> без id, isDeleted в теле игнорируется
     */
    public readonly create = async (req: ValidatedRequest<CreateUserBodySchema>, res: Response, next: NextFunction) => {
        this.logger.debug('create called', getRequestIdMeta(res));

        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json(user);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Редактирует пользователя.
     * @example PUT api/user/:id
     * body: Partial<User>, id и isDeleted в теле игнорируется, остальные поля мёржатся в текущий стэйт
     * TODO: может PATCH?
     */
    public readonly update = async (req: ValidatedRequest<UpdateUserBodySchema>, res: Response, next: NextFunction) => {
        this.logger.debug('update called', getRequestIdMeta(res));

        try {
            const {id} = req.params;
            const user = await this.userService.updateUser({...req.body, id});
            if (user) {
                res.json(user);
            }
            else {
                throw new NotFoundError('User', id);
            }
        } catch (err) {
            next(err);
        }
    }

    /**
     * Удаляет пользователя по id.
     * @example DELETE /user/:id
     * @returns если найден, то код 200, иначе 404 и 
     */
    public readonly delete = async (req: ValidatedRequest<GetByIdParamSchema>, res: Response, next: NextFunction) => {
        this.logger.debug('delete called', getRequestIdMeta(res));

        try {
            const {id} = req.params;
            const user = await this.userService.deleteUser(id);
            if (user) {
                res.send(user);
            }
            else {
                throw new NotFoundError('User', id);
            }
        } catch (err) {
            next(err);
        }
    }

    /**
     * Ищет пользователей по подстроке в логине.
     * @example GET api/users/suggest?login=partialName&limit=N, где
     * partialName - подстрока логина; N - число, ограничиваюшее resultSet. По умолчанию 10.
     * @returns {User[]} - если найдены, то HttpCode 200 и массив User, иначе, HttpCode 204 без тела.
     */
    public readonly getSuggests = async (req: ValidatedRequest<SuggestsUserSchema>, res: Response, next: NextFunction) => {
        this.logger.debug('getSuggest called', getRequestIdMeta(res));

        try {
            const {query} = req;

            const users = await this.userService.findUserByLogin(query.login, query.limit);
            if (!users || !users.length) {
                res.status(204);
            }
            res.json(users);
        } catch (err) {
            next(err);
        }
    }

    protected readonly installRoutes = (router: Router) => {
        router
            .get('/users', userControllerValidator.query(qsGetAll), this.getAll)
            .get('/users/count', this.getCount)
            .get('/user/:id', userControllerValidator.params(paramGetById), this.getById)
            .post('/user', userControllerValidator.body(bodyCreateUser), this.create)
            .put('/user/:id', userControllerValidator.params(paramGetById), userControllerValidator.body(bodyCreateUser), this.update)
            .delete('/user/:id', userControllerValidator.params(paramGetById), this.delete)
            .get('/users/suggest', userControllerValidator.query(qsSuggestsUser), this.getSuggests);

        this.logger.debug(`Route GET ${this.makePath('users')} added`);
        this.logger.debug(`Route GET ${this.makePath('users/count')} added`);
        this.logger.debug(`Route GET ${this.makePath('user/:id')} added`);
        this.logger.debug(`Route POST ${this.makePath('user')} added`);
        this.logger.debug(`Route PUT ${this.makePath('user/:id')} added`);
        this.logger.debug(`Route DEL ${this.makePath('user/:id')} added`);
        this.logger.debug(`Route GET ${this.makePath('user/suggest')} added`);
    }
}
