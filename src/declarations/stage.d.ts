declare namespace $P {
    class Stage extends Base {
        private _props;
        constructor(_props?: Prop[]);
        get props(): Prop[];
        getIndex(prop: Prop): number;
        addProp(prop: Prop, index?: number, quiet?: boolean): number;
        addProps(arr: Prop[], index?: number, quiet?: boolean): number;
        removeProp(prop: Prop, quiet?: boolean): number;
        removePropByUID(uid: string, quiet?: boolean): {
            prop: Prop;
            index: number;
        };
        removePropByIndex(index: number, quiet?: boolean): Prop;
        moveProp(curIndex: number, newIndex: number): number;
        update(dt: number): void;
        updateLoop(interval?: number): void;
    }
}
