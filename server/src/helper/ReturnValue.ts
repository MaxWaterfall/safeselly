export type ReturnValue<T> = {
    error: boolean,
    errorMessage?: string,
    value?: T
}