import {PrismaClient, User} from '@prisma/client'

const prisma = new PrismaClient();

const reportItemId = (u: User) => console.log(`User ${u.id} created`);

// Проверка в DBeaver: select * from serviceschema."User";

async function main() {
    let user = await prisma.user.upsert({
        where: {id: '37c5c90e-551d-43ab-af2e-6a424d5e6d2d'},
        update: {},
        create: {
            id: '37c5c90e-551d-43ab-af2e-6a424d5e6d2d',
            login: 'Andrey',
            password: 'xxx',
            age: 27,
            isDeleted: false,
        },
    });
    reportItemId(user);

    user = await prisma.user.upsert({
        where: {id: 'bf2ba91c-e3ac-47f4-9e53-6ddb85245659'},
        update: {},
        create: {
            id: 'bf2ba91c-e3ac-47f4-9e53-6ddb85245659',
            login: 'Alexey',
            password: 'yyy',
            age: 31,
        },
    });
    reportItemId(user);

    user = await prisma.user.upsert({
        where: {id: '0f3b5819-c7fe-4e8f-b061-33f7aa266803'},
        update: {},
        create: {
            id: '0f3b5819-c7fe-4e8f-b061-33f7aa266803',
            login: 'Ilea',
            password: '12345678',
            age: 35,
        },
    });
    reportItemId(user);

    user = await prisma.user.upsert({
        where: {id: 'ea6c8250-4ed2-47f3-8638-b661400fe24d'},
        update: {},
        create: {
            id: 'ea6c8250-4ed2-47f3-8638-b661400fe24d',
            login: 'Timur',
            password: '_12345678',
            age: 41,
        },
    });
    reportItemId(user);

    user = await prisma.user.upsert({
        where: {id: 'bf99e759-a844-43bf-8373-386c22699656'},
        update: {},
        create: {
            id: 'bf99e759-a844-43bf-8373-386c22699656',
            login: 'PavelV',
            password: 'zzz_yyy',
            age: 33,
        },
    });
    reportItemId(user);
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
