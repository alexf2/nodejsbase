import {PrismaClient, User} from '@prisma/client'
import {testUsers} from '../src/part2_testData';

const prisma = new PrismaClient();

const reportItemId = (u: User) => console.log(`User ${u.id} created`);

// Проверка в DBeaver: select * from serviceschema."User";

async function main() {
    for (const user of testUsers) {
        const u = await prisma.user.upsert({
            where: {id: user.id},
            update: {},
            create: {...user},
        });
        reportItemId(u);
    }
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
