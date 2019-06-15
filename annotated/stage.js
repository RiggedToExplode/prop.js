$P.Stage = class extends $P.Base {
  constructor() {
    super(); //Invoke inheritance constructor

    this._props = []; //Props on this stage
  }


  get props() {
    return this._props;
  }


  addProp(prop, index = -1, quiet = false) { //Add prop to stage
    let len;
    if (index >= 0) { //insert prop at specific index if provided
      this._props.splice(index, 0, prop); //Add prop at index
      len = this._props.length; //Get length
    } else {
      len = this._props.push(prop); //Add prop && get length
    }
    prop.stage = this; //set prop's stage as this stage
    prop.init(quiet); //Init the prop
    return len; //Return the length of props array
  }

  addProps(arr, index = -1, quiet = false) { //Add array of props to stage
    if (index >= 0) { //Add props at specific index
      for (var i in arr) { //Iterate through array
        this._props.splice(index, 0, arr[i]); //Add prop
        arr[i].stage = this; //Set prop stage
        arr[i].init(quiet); //Init prop
      }
    } else { //Push props to end
      for (var i in arr) { //Iterate through array
        this._props.push(arr[i]); //Add prop
        arr[i].stage = this; //Set prop stage
        arr[i].init(quiet); //Init prop
      }
    }
    return this._props.length; //Return length of props array
  }

  removeProp(prop, quiet = false) { //Remove by direct comparison
    let index = prop.index; //Get index of prop

    if (index !== -1) { //index will = -1 if prop is not in props array
      this._props[index].destroy(quiet); //Call destroy function of prop in question
      this._props[index].stage = null; //set prop as having no stage
      this._props.splice(index, 1); //Remove prop
      return index; //Return index that prop was at.
    }

    return false; //Return false for failure
  }

  removePropByID(uuid, quiet = false) { //Remove by UUID comparison
    for (var i in this._props) { //Iterate over all props in props array
      if (this._props[i].uuid === uuid) { //Compare UUIDs
        this._props[i].destroy(quiet); //Call destroy function of prop in question
        this._props[i].stage = null; //set prop as having no stage
        let prop = this._props.splice(i, 1)[0]; //Remove and save prop
        return { prop: prop, index: i }; //Return the prop and index of prop in an object.
      }
    }

    return false; //Return false for failure.
  }

  removePropByIndex(index, quiet = false) { //Remove at a specific index
    if (this._props[index]) { //Verify index in order to avoid error when calling destroy()
      this._props[index].destroy(quiet); //Call destroy function of prop
      this._props[index].stage = null; //set prop as having no stage
      let prop = this._props.splice(index, 1)[0]; //Remove and save prop
      return prop; //Return removed prop
    }

    return false; //Return false for failure
  }

  moveProp(curIndex, newIndex) { //Move prop in props array (emulates z-index due to for/in function)
    let prop = this._props.splice(curIndex, 1)[0];
    let index;

    if (newIndex < 0 || newIndex >= this._props.length) {
      index = this._props.push(prop) - 1;
      return index;
    }

    this._props.splice(newIndex, 0, prop);
    return newIndex;
  }


  update(dt) { //Cascading update function
    for (var i in this._props) {
      this._props[i].update(dt);
    }

    return true;
  }
}