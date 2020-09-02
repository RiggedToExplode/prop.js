namespace $P {
    export class Stage extends Base { //Stage class to store and manage Prop objects.
        protected _type: string = "stage";

        constructor(private _props: Prop[] = []) {
            super();
        }


        get props(): Prop[] { //Public getter for _props array.
            return this._props;
        }


        getIndex(prop: Prop): number { //Get the index of the given Prop.
            return this._props.indexOf(prop);
        }

        addProp(prop: Prop, index: number = -1, quiet: boolean = false): number { //Add the given prop to the _props array at the given index.
            if (index >= 0) { //If the index is provided:
                this._props.splice(index, 0, prop); //Insert the prop at the index.
            } else {
                this._props.push(prop); //Push the prop to the end of the _props array.
            }
            prop.stage = this; //Set the prop's stage to this stage.
            prop.init(quiet); //Call the prop's initialize method.
            return this._props.length; //Return the new length of the _props array.
        }

        addProps(arr: Prop[], index: number = -1, quiet: boolean = false): number { //Add an array of props to the _props array, starting at the given index.
            if (index >= 0) { //If the index is provided:
                arr.forEach(prop => this._props.splice(index, 0, prop)); //Iterate through the given props and add each one to the _props array, starting at the given index.
            } else {
                arr.forEach(prop => this._props.push(prop)); //Iterate through the given props and push each one to the end of the _props array.
            }

            arr.forEach(prop => { //Iterate through each given prop and:
                prop.stage = this; //Set their stage to this stage
                prop.init(quiet); //Call their initialize method
            });

            return this._props.length; //Return the new length of the _props array.
        }

        removeProp(prop: Prop, quiet: boolean = false): number { //Remove the given prop from the _props array.
            let index = prop.index; //Get the index of the prop.

            if (index !== -1) { //If the index does not equal -1 (prop is in _props array)
                prop.remove(quiet); //Call the prop's remove method.
                prop.stage = null; //Remove this stage from the prop's stage property.
                this._props.splice(index, 1); //Remove the prop from the _props array.
                return index; //Return the index that the prop was at.
            }

            return -1; //Return -1 if the prop is not in the _props array.
        }

        removePropByUID(uid: string, quiet: boolean = false): {prop: Prop, index: number} { //Remove the prop with the given UID from the _props array.
            let prop = this._props.find(prop => prop.uid === uid); //Find the prop by UID.

            if (prop) { //If the prop could be found:
                let index = prop.index; //Store the prop's index.

                prop.remove(quiet); //Call the prop's remove method.
                prop.stage = null; //Remove this stage from the prop's stage property.
                this._props.splice(index, 1); //Remove the prop from the _props array.

                return {prop: prop, index: index}; //Return an object containing the prop that was removed and the index it was at.
            }

            return {prop: null, index: -1}; //Return an object with null and -1 values to indicate that a prop with the given UID could not be found.
        }

        removePropByIndex(index: number, quiet: boolean = false): Prop { //Remove the prop at the given index.
            if (this._props[index]) { //If a prop exists at the given index:
                let prop = this._props[index]; //Store the prop.

                prop.remove(quiet); //Call the prop's remove method.
                prop.stage = null; //Remove this stage from the prop's stage property.
                this._props.splice(index, 1); //Remove the prop from the _props array.

                return prop; //Return the prop that was removed.
            }

            return null; //Return null to indicate that a prop did not exist at the given index.
        }

        moveProp(curIndex: number, newIndex: number): number { //Move a prop at the given index to a new index.
            let prop = this._props.splice(curIndex, 1)[0]; //Store the prop we are moving, and remove it from its place in the _props array.
            let index: number; //Declare index variable.
            
            if (newIndex < 0 || newIndex >= this._props.length) { //If the new index is less than 0 or more than the _props array length:
                index = this._props.push(prop) - 1; //Add the prop to the end of the array.
                return index; //Return the index the prop was added at.
            }
            
            this._props.splice(newIndex, 0, prop); //Add the prop at the provided index.
            return newIndex; //Return the provided index.
        }

        update(dt: number) { //Update all props in the _props array.
            this._props.forEach(prop => prop.beforeUpdate(dt));

            this._props.forEach(prop => prop.update(dt));

            this._props.forEach(prop => prop.afterUpdate(dt));
        }

        updateLoop(interval: number = 1) {
            let lastUpdate = Date.now();

            window.setInterval(() => {
                let now = Date.now();
                let dt = now - lastUpdate;
                lastUpdate = now;

                this.update(dt);
            }, interval);
        }
    }
}