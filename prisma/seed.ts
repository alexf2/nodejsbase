import {PrismaClient, User, Group} from '@prisma/client'
import {getTestUsers} from '../src/part2_testData';
import {testGroups} from '../src/part4_testData';

const prisma = new PrismaClient();

const reportNewUser = (u: User) => console.log(`User ${u.id} created`);
const reportNewGroup = (g: Group) => console.log(`Group ${g.id} created`);
const reportUserGroups = (g: any) => {
    console.log(`[${g.name}] --> ${g.users.map(u => u.user.login).join(', ')}`);
}

// Проверка в DBeaver: select * from serviceschema."User";

async function addUsers() {
    for (const user of await getTestUsers()) {
        const u = await prisma.user.upsert({
            where: {id: user.id},
            update: {},
            create: {...user},
        });
        reportNewUser(u);
    }
}
async function addGroups() {
    for (const group of testGroups) {
        const g = await prisma.group.upsert({
            where: {id: group.id},
            update: {},
            create: {...group},
        });
        reportNewGroup(g);
    }
}

async function assignGroupd() {
    await prisma.user.update({
        where: {login: 'Andrey'},
        data: {
            groups: {
                create: [
                    {group: {connect: {name: 'Regular User'}}},
                    {group: {connect: {name: 'Underwriter'}}},
                ],
            },
        },
    });

    await prisma.user.update({
        where: {login: 'Alexey'},
        data: {
            groups: {
                create: [
                    {group: {connect: {name: 'Power User'}}},
                    {group: {connect: {name: 'Underwriter'}}},
                    {group: {connect: {name: 'Admin'}}},
                ],
            },
        },
    });

    await prisma.user.update({
        where: {login: 'Timur'},
        data: {
            groups: {
                create: [
                    {group: {connect: {name: 'Guest'}}},
                ],
            },
        },
    });

    await prisma.user.update({
        where: {login: 'PavelV'},
        data: {
            groups: {
                create: [
                    {group: {connect: {name: 'Guest'}}},
                ],
            },
        },
    });

    await prisma.user.update({
        where: {login: 'Ilea'},
        data: {
            groups: {
                create: [
                    {group: {connect: {name: 'Power User'}}},
                ],
            },
        },
    });

    for (const group of testGroups) {
        const g = await prisma.group.findFirst({
            where: {id: group.id},
            select: {
                name: true,
                users: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                login: true,
                            }
                        }
                    },
                },
            },
        });
        reportUserGroups(g);
    }
}

async function main() {
    console.log('Adding users:');
    await addUsers();
    console.log('\nAdding groups:');
    await addGroups();
    console.log('\nLinking groups:');
    await assignGroupd();
}

main()
    .catch(e => {
        console.error('Error at seeding Db:');
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    });
