export const getCodeByError = (err: any) => {
    if (err instanceof SyntaxError) {
        return 400;
    }
    return 500;
}
