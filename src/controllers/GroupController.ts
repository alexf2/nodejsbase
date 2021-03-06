// import {URLSearchParams} from 'url';
import {ValidatedRequest} from 'express-joi-validation';
import {NextFunction, Request, Response, Router} from 'express';
import {Logger, NotFoundError, getRequestIdMeta, safeAsyncHandler} from '../helpers';
import {ControllerBase} from './ControllerBase';
import {IGroupService} from '../services';
import {
    GetAllQuerySchema,
    qsGetAll,
    paramGetById,
    GetByIdParamSchema,
} from './common.schemas';
import {
    groupControllerValidator,
    bodyCreateGroup,
    CreateGroupBodySchema,
    UpdateGroupBodySchema,
    AddUsersToGroupBodySchema,
    bodyAddUsersToGroup,
} from './groupcontroller.schemas';
import {BASE_URL} from './const';

export class GroupController extends ControllerBase {
    constructor(logger: Logger, private groupService: IGroupService) {
        super(BASE_URL, logger);
    }

    public readonly getAll = safeAsyncHandler(async (req: ValidatedRequest<GetAllQuerySchema>, res: Response, next: NextFunction) => {
        this.logger.debug('getAll called', getRequestIdMeta(req));

        const {query} = req;

        const groups = await this.groupService.getAllGroups(query.limit);

        if (!groups || !groups.length) {
            res.status(204);
        }
        res.json(groups);
    })

    public readonly getCount = safeAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        this.logger.debug('getCount called', getRequestIdMeta(req));

        const count = await this.groupService.countGroups();
        res.json(count);
    })

    public readonly getById = safeAsyncHandler(async (req: ValidatedRequest<GetByIdParamSchema>, res: Response, next: NextFunction) => {
        this.logger.debug('getGroupById called', getRequestIdMeta(req));

        const {id} = req.params;
        const group = await this.groupService.getGroupById(id);
        if (group) {
            res.json(group);
        } else {
            throw new NotFoundError('Group', id);
        }
    })

    public readonly create = safeAsyncHandler(async (req: ValidatedRequest<CreateGroupBodySchema>, res: Response, next: NextFunction) => {
        this.logger.debug('create called', getRequestIdMeta(req));

        const group = await this.groupService.createGroup(req.body);
        res.status(201).json(group);
    })

    public readonly update = safeAsyncHandler(async (req: ValidatedRequest<UpdateGroupBodySchema>, res: Response, next: NextFunction) => {
        this.logger.debug('update called', getRequestIdMeta(req));

        const {id} = req.params;
        const group = await this.groupService.updateGroup({...req.body, id});
        if (group) {
            res.json(group);
        }
        else {
            throw new NotFoundError('Group', id);
        }
    })

    public readonly delete = safeAsyncHandler(async (req: ValidatedRequest<GetByIdParamSchema>, res: Response, next: NextFunction) => {
        this.logger.debug('delete called', getRequestIdMeta(req));

        const {id} = req.params;
        const group = await this.groupService.deleteGroup(id);
        if (group) {
            res.json(group);
        }
        else {
            throw new NotFoundError('Group', id);
        }
    })

    public readonly addUsersToGroup = safeAsyncHandler(async (
        req: ValidatedRequest<AddUsersToGroupBodySchema>,
        res: Response,
        next: NextFunction) => {

        this.logger.debug('addUsersToGroup called', getRequestIdMeta(req));

        const {id} = req.params;
        const users = await this.groupService.addUsersToGroup(id, req.body);

        res.send(users);
    })

    protected readonly installRoutes = (router: Router) => {
        router
            .get('/groups', groupControllerValidator.query(qsGetAll), this.getAll)
            .get('/groups/count', this.getCount)
            .get('/group/:id', groupControllerValidator.params(paramGetById), this.getById)
            .post('/group', groupControllerValidator.body(bodyCreateGroup), this.create)
            .put('/group/:id', groupControllerValidator.params(paramGetById), groupControllerValidator.body(bodyCreateGroup), this.update)
            .delete('/group/:id', groupControllerValidator.params(paramGetById), this.delete)
            .post('/group/:id/users',
                groupControllerValidator.params(paramGetById),
                groupControllerValidator.body(bodyAddUsersToGroup),
                this.addUsersToGroup);

        this.logger.debug(`Route GET ${this.makePath('groups')} added`);
        this.logger.debug(`Route GET ${this.makePath('group/:id')} added`);
        this.logger.debug(`Route POST ${this.makePath('group')} added`);
        this.logger.debug(`Route PUT ${this.makePath('group/:id')} added`);
        this.logger.debug(`Route DELETE ${this.makePath('group/:id')} added`);
        this.logger.debug(`Route POST ${this.makePath('group/:id/users')} added`);
    }
}
