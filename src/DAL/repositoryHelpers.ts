/**
 * Заменяет "Not Found" на возврат пустого значения вместо ошибки.
 * Другие исключения перевозбуждает повторно.
 * @param err 
 * @returns undefined - если объект не найден в базе
 */
export const prismaErrorFilter = (err: any) => {
    if (err.code === 'P2025') {
        return undefined;
    }

    throw err;
};
