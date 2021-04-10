import {UserRepositoryInMemory} from '../DAL/UserRepositoryInMemory';
import {UserRepositoryPrisma} from '../DAL/UserRepositoryPrisma';
import {Config} from './Config';
import {IUser} from '../DAL/models';
import {testUsers} from '../part2_testData';

export const repositoryFactory = () => {
    switch (Config.repositoryType) {
        case 'prisma':
            return new UserRepositoryPrisma();

        default:
            return new UserRepositoryInMemory(testUsers as IUser[]);
    }
}
