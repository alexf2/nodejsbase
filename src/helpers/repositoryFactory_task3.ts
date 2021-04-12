import {PrismaClient} from '@prisma/client'
import {UserRepositoryInMemory} from '../DAL/UserRepositoryInMemory';
import {UserRepositoryPrisma} from '../DAL/UserRepositoryPrisma';
import {GroupRepositoryPrisma} from '../DAL/GroupRepositoryPrisma';
import {Config} from './Config';
import {IUser} from '../DAL/models';
import {testUsers} from '../part2_testData';
import {loggers} from './loggers';

const userRepoFactory = (client?: PrismaClient) => {
    switch (Config.repositoryType) {
        case 'prisma':
            return new UserRepositoryPrisma(client);

        default:
            return new UserRepositoryInMemory(testUsers as IUser[]);
    }
}

const groupRepoFactory = (client: PrismaClient) => new GroupRepositoryPrisma(client);

export const repositoryFactory = async () => {
    const client = new PrismaClient(Config.prismaConfig)
    await client.$connect();

    return {
        repo: {
            userRepo: userRepoFactory(client),
            groupRepo: groupRepoFactory(client),
        },
        logger: {
            userLogger: Config.repositoryType === 'prisma' ? loggers.PrismaUserService : loggers.MemoryUserService,
            groupLogger: loggers.PrismaGroupService,
        },
    };
}
