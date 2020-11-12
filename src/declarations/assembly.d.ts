declare namespace $P {
    class MemoryManager {
        protected memory: WebAssembly.Memory;
        protected _target: number;
        protected _free: number[];
        protected _type: string;
        arr: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;
        constructor(memory: WebAssembly.Memory, arrayType?: string);
        get type(): string;
        write(val: number, loc?: number): number;
        query(loc: number): number;
        free(loc: number): void;
    }
    class BlockMemoryManager extends MemoryManager {
        private _blockSize;
        protected _type: string;
        constructor(memory: WebAssembly.Memory, arrayType?: string, blockSize?: number);
        get blockSize(): number;
        write(val: number, loc: number): number;
        writeBlock(val: number[], loc?: number): number;
    }
    class AssemblyModule {
        src: string;
        private _type;
        private _exports;
        private _module;
        constructor(src: string);
        get type(): string;
        get exports(): any;
        get memory(): WebAssembly.Memory;
        get module(): any;
        init(memory: WebAssembly.Memory): Promise<any>;
    }
    var coreMemoryManager: BlockMemoryManager;
    const coreModule: AssemblyModule;
    function init(src?: string, arrayType?: string, pagesInitial?: number, pagesMax?: number): Promise<void>;
}
