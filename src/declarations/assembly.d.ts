declare namespace $P {
    class MemoryManager {
        protected memory: WebAssembly.Memory;
        arr: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;
        protected target: number;
        protected free: number[];
        constructor(memory: WebAssembly.Memory, arrayType?: string);
        write(val: number, loc?: number): number;
        query(loc: number): number;
        remove(loc: number): void;
    }
    class BlockMemoryManager extends MemoryManager {
        private blockSize;
        constructor(memory: WebAssembly.Memory, arrayType?: string, blockSize?: number);
        write(val: number, loc?: number): number;
        writeBlock(val: number[], loc?: number): number;
        remove(loc: number): number;
        removeBlock(loc: number): void;
    }
    class AssemblyModule {
        src: string;
        private _exports;
        private _module;
        constructor(src: string);
        init(memory: WebAssembly.Memory): Promise<any>;
        get exports(): any;
        get memory(): WebAssembly.Memory;
        get module(): any;
    }
    var coreMemoryManager: BlockMemoryManager;
    const coreModule: AssemblyModule;
    function init(src?: string, arrayType?: string, pagesInitial?: number, pagesMax?: number): Promise<void>;
}