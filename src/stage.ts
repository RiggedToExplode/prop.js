/*==========*\
|  STAGE.TS  |
\*==========*/

/* SEE ALSO:
 *
 * prop.ts for its definition of the Prop class
 */

namespace $P {
    /* STAGE CLASS
     *
     * The Stage class holds props in a props array, effectively collecting all props for easy execution of the update and draw cycles.
     * It also exposes multiple methods for adding, removing, and moving props to, from, and in the props array. The Stage class manages
     * execution of the update cycle.
     */
    export class Stage extends Base {
        // PROPERTIES
        protected _type: string = "stage"; //The type of this class

        
        /* CONSTRUCTOR
         *
         * Parameters: array of Props to place in the Stage from the getgo
         * 
         * This constructor simply sets the props array at the outset, and calls the Base constructor to generate a UID.
         */
        constructor(private _props: Prop[] = []) {
            super();
        }


        // GETTERS
        get props(): Prop[] { //Public getter for _props array. Unsettable.
            return this._props;
        }


        // METHODS
        /* GETINDEX METHOD
         *
         * Parameters: Prop to get index of
         * 
         * The getIndex method takes in one Prop and returns the index of that Prop in the _props array.
         */
        getIndex(prop: Prop): number {
            return this._props.indexOf(prop);
        }

        /* ADDPROP METHOD
         * 
         * Parameters: Prop to add, index to insert prop at, whether to insert prop "quietly"
         * 
         * The addProp method adds the specified Prop to the _props array at the specified index (or at the end if no index is provided).
         * It then calls the init() hook for the specified Prop, passing in the provided quiet value.
         */
        addProp(prop: Prop, index: number = -1, quiet: boolean = false): number {
            if (index >= 0) { //If the index is provided:
                this._props.splice(index, 0, prop); //Insert the prop at the index.
            } else {
                this._props.push(prop); //Push the prop to the end of the _props array.
            }

            prop.stage = this; //Set the prop's stage to this stage.
            prop.init(quiet); //Call the prop's initialize method.

            return this._props.length; //Return the new length of the _props array.
        }

        /* ADDPROPS
         *
         * Parameters: array of Props to add, index to insert Props at, whether to add Props "quietly"
         * 
         * The addProps method inserts the provided array of Props into the _props array at the provided index. It then
         * passes the provided quiet value into the init() hook for each Prop added.
         */
        addProps(arr: Prop[], index: number = -1, quiet: boolean = false): number {
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

        /* REMOVEPROP METHOD
         *
         * Parameters: Prop to remove, whether to remove Prop "quietly"
         * 
         * The removeProp method removes the specified Prop from the _props array, but not before calling the Prop's remove()
         * hook with the provided quiet value.
         */
        removeProp(prop: Prop, quiet: boolean = false): number {
            let index = prop.index; //Get the index of the prop.

            if (index !== -1) { //If the index does not equal -1 (prop is in _props array)
                prop.remove(quiet); //Call the prop's remove method.
                prop.stage = null; //Remove this stage from the prop's stage property.
                this._props.splice(index, 1); //Remove the prop from the _props array.

                return index; //Return the index that the prop was at.
            }

            return -1; //Return -1 if the prop is not in the _props array.
        }

        /* REMOVEPROPBYUID METHOD
         *
         * Parameters: uid of Prop to remove, whether to remove Prop "quietly"
         * 
         * The removePropByUID method removes the first instance of a Prop in the _props array with a UID matching that
         * specified. Before doing so, it calls the Prop's remove() hook with the specified quiet value. 
         */
        removePropByUID(uid: string, quiet: boolean = false): {prop: Prop, index: number} {
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

        /* REMOVEPROPBYINDEX METHOD
         *
         * Parameters: index of Prop to remove, whether to remove Prop "quietly"
         * 
         * The removePropByIndex method removes the Prop at the specified index in the _props array, but not before calling the Prop's
         * remove() hook with the specified quiet value.
         */
        removePropByIndex(index: number, quiet: boolean = false): Prop {
            if (this._props[index]) { //If a prop exists at the given index:
                let prop = this._props[index]; //Store the prop.

                prop.remove(quiet); //Call the prop's remove method.
                prop.stage = null; //Remove this stage from the prop's stage property.
                this._props.splice(index, 1); //Remove the prop from the _props array.

                return prop; //Return the prop that was removed.
            }

            return null; //Return null to indicate that a prop did not exist at the given index.
        }

        /* MOVEPROP METHOD
         *
         * Parameters: current index of Prop to move, desired index for Prop
         * 
         * The moveProp method moves the Prop at the provided index to the desired index.
         */
        moveProp(curIndex: number, newIndex: number): number {
            let prop = this._props.splice(curIndex, 1)[0]; //Store the prop we are moving, and remove it from its place in the _props array.
            let index: number; //Declare index variable.
            
            if (newIndex < 0 || newIndex >= this._props.length) { //If the new index is less than 0 or more than the _props array length:
                index = this._props.push(prop) - 1; //Add the prop to the end of the array.
                return index; //Return the index the prop was added at.
            }
            
            this._props.splice(newIndex, 0, prop); //Add the prop at the provided index.
            return newIndex; //Return the provided index.
        }

        /* CLEAR METHOD
         *
         * Parameters: None
         * 
         * The clear method empties the _props array of all Props.
         */
        clear(): Prop[] {
            let arr = this._props;

            this._props = [];

            return arr;
        }

        /* UPDATE METHOD
         *
         * Parameters: milliseconds since last update cycle
         * 
         * The update method executes the update cycle by calling beforeUpdate for every Prop, then
         * update for every Prop, then afterUpdate for every Prop, all while passing the time passed
         * since the last cycle into each hook.
         */
        update(dt: number) {
            this._props.forEach(prop => prop.beforeUpdate(dt));

            this._props.forEach(prop => prop.update(dt));

            this._props.forEach(prop => prop.afterUpdate(dt));
        }

        /* STARTUPDATECYCLE METHOD
         *
         * Parameters: minimum number of milliseconds to wait between cycles
         * 
         * The startUpdateCycle performs all the operations needed to set a constant update cycle in motion
         * on this Stage. By default it executes the cycle every millisecond, but a different interval can be 
         * specified.
         */ 
        startUpdateCycle(interval: number = 1) {
            let lastUpdate = Date.now(); //Set the "initial" last update time.

            window.setInterval(() => { //Cycle code:
                let now = Date.now(); //Get current time
                let dt = now - lastUpdate; //Calculate time passed since last cycle from difference of current time and time at last cycle
                lastUpdate = now; //Set the last cycle time to now.

                this.update(dt); //Execute the update cycle.
            }, interval);
        }
    }
}