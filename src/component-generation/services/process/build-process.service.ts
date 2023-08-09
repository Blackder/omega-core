export interface BuildProcess {
    build(config): Promise<string>;
}
