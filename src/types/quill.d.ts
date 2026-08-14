// Quill 1.3.7 ships no type definitions, and ngx-quill 23's own .d.ts imports
// `{ Delta }` — a named export that only exists in Quill 2 (and not in
// @types/quill, which models Quill 1). Installing @types/quill therefore fails
// to compile, so this ambient shim satisfies both sides instead.
//
// We only touch the editor instance through a handful of methods
// (getSelection / getLength / insertEmbed / setSelection) in
// admin/blogs/blog-form.component.ts, so the loose typing costs us nothing.
// Drop this file if the project ever moves to Quill 2, which is self-typed.
declare module 'quill' {
  // Declared as a class so it works in both value and type position — ngx-quill
  // uses `QuillType` for both.
  class Quill {
    constructor(...args: any[]);
    [key: string]: any;
    static import(path: string): any;
    static register(...args: any[]): any;
    static find(node: any): any;
  }
  export default Quill;
  export type Delta = any;
  export type Sources = 'api' | 'user' | 'silent';
  export type RangeStatic = { index: number; length: number };
  export type QuillOptionsStatic = Record<string, any>;
}
