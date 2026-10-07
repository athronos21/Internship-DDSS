/// <reference types="vite/client" />

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module 'bun:sqlite' {
  export class Database {
    constructor(
      filename?: string,
      options?: number | { readonly?: boolean; create?: boolean; readwrite?: boolean; safeintegers?: boolean; strict?: boolean }
    );
    run(sql: string, ...params: any[]): any;
    query(sql: string): any;
    prepare(sql: string): any;
    exec(sql: string): void;
    close(throwOnError?: boolean): void;
    transaction<T extends (...args: any[]) => any>(fn: T): T;
    loadExtension(path: string): void;
  }
  export default Database;
}
