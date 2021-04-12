import {IGroupService} from './services.types';
import {IGroup} from 'DAL/models';
import {Logger} from '../helpers';
import {IGroupRepository} from 'DAL/dal.types';

export class GroupService implements IGroupService {
    constructor(private logger: Logger, private db: IGroupRepository) {
    }

    public readonly getAllGroups = async (limit?: number | null) => this.db.getAll(limit);

    public readonly countGroups = async () => this.db.count();

    public readonly getGroupById = async (id: string) => this.db.getById(id);

    public readonly createGroup = async (data: Partial<Readonly<IGroup>>) => this.db.create(data);

    public readonly updateGroup = async (data: Partial<Readonly<IGroup>>) => this.db.update(data.id!, data);

    public readonly deleteGroup = async (id: string) => this.db.delete(id);

    public readonly addUsersToGroup = async (groupId: string, userIds: string[]) => this.db.addUsersToGroup(groupId, userIds);
}
