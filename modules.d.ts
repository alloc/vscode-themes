declare module "json-in-place" {
  interface JSONEditor {
    set(keyPath: string, value: any): JSONEditor;
    toString(): string;
  }
  function jsonInPlace(json: string): JSONEditor;
  export = jsonInPlace;
}
