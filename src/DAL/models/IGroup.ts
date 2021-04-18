import {Permission} from '@prisma/client'

export interface IGroup {
    id: string;
    name: string;
    permissions: Permission[];
}
