import {Group, Permission} from '@prisma/client'

export const testGroups = [
    {
        id: '11c5c90e-551d-43ab-af2e-6a424d5e6d2d',
        name: 'Guest',
        permissions: [Permission.READ],
    },

    {
        id: '21c5c90e-551d-43ab-af2e-6a424d5e6d2d',
        name: 'Regular User',
        permissions: [Permission.READ, Permission.WRITE, Permission.UPLOAD_FILES],
    },

    {
        id: '31c5c90e-551d-43ab-af2e-6a424d5e6d2d',
        name: 'Power User',
        permissions: [Permission.READ, Permission.WRITE, Permission.UPLOAD_FILES, Permission.SHARE],
    },

    {
        id: '41c5c90e-551d-43ab-af2e-6a424d5e6d2d',
        name: 'Admin',
        permissions: [Permission.READ, Permission.WRITE, Permission.UPLOAD_FILES, Permission.SHARE, Permission.DELETE],
    },

    {
        id: '51c5c90e-551d-43ab-af2e-6a424d5e6d2d',
        name: 'Underwriter',
        permissions: [Permission.READ, Permission.WRITE, Permission.SHARE],
    },
] as Group[];
