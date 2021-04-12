import {v4 as uuidv4} from 'uuid';
import {PrismaClient} from '@prisma/client'
import {IGroup, groupModel2View, mapGroupModel2View} from '../DAL/models';
import {IGroupRepository} from './dal.types';
import {Config} from '../helpers';
import {prismaErrorFilter} from './repositoryHelpers';

const RESULTSET_LIMIT = 10;

const includeUsersCondition = {
    include: {
        users: {
            where: {user: {OR: [{isDeleted: false}, {isDeleted: null}]}},
            select: {
                user: true,
            },
        },
    },
};

export class GroupRepositoryPrisma implements IGroupRepository {
    private dbClient;
    private ownsClient: boolean;

    constructor (client?: PrismaClient) {
        this.ownsClient = !client;
        this.dbClient = client || new PrismaClient(Config.prismaConfig);
    }

    public readonly open = () => this.ownsClient ? this.dbClient.$connect() : Promise.resolve();
    public readonly destroy = () => this.ownsClient ? this.dbClient.$disconnect() : Promise.resolve();

    public readonly getAll = async (limit?: number | null) => this.dbClient.group.findMany(
        {
            ...(limit && {take: limit}),
            ...includeUsersCondition,
        },
    ).then(mapGroupModel2View);

    public readonly getById = async (id: string) =>
        this.dbClient.group.findUnique({where: {id}, ...includeUsersCondition})
            .then(groupModel2View);

    public readonly create = async (group?: Partial<IGroup> | null) => this.dbClient.group.create(
        {data: {
            ...group,
            id: uuidv4(),
        } as IGroup},
    );

    public readonly update = async (groupId: string, group: Partial<IGroup>) => {
        const {id, ...rest} = group;

        return this.dbClient.group.update({
            where: {id: groupId},
            data: {...rest} as IGroup,
        }).catch(prismaErrorFilter);
    }

    // TODO: разобраться как ловить ошибки. Например P2025.
    // Надо поймать NotFound и вернуть undefined.
    public readonly delete = async (id: string) => {
        const checkGroup = await this.dbClient.group.findUnique({where: {id}});
        if (!checkGroup) {
            return;
        }

        const [links, group] = await this.dbClient.$transaction([
            this.dbClient.userGroup.deleteMany({where: {idGroup: id}}),

            this.dbClient.group.delete({where: {id}}),
        ]).catch(prismaErrorFilter);

        return group;
    }

    public readonly clear = async () => (await this.dbClient.group.deleteMany()).count;

    public readonly count = async () => this.dbClient.group.count();

    public readonly addUsersToGroup = async (idGroup: string, userIds: string[]) => {
        const usersAlreadyIncluded = await this.dbClient.userGroup.findMany({
            where: {AND: [{idGroup}, {idUser: {in: userIds}}]},
        }).then(users => users.map(u => u.idUser));

        const usersToInclude = userIds.filter(userId => !usersAlreadyIncluded.includes(userId));

        return this.dbClient.userGroup.createMany({
            data: usersToInclude.map(idUser => ({idGroup, idUser})),
        }).then(() => usersToInclude)
    }
}
