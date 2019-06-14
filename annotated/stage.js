$P.Stage = class extends $P.Base {
  constructor() {
    super(); //Invoke inheritance constructor

    this._props = []; //Props on this stage
  }


  get props() {
    return this._props;
  }


  addProp(prop, quiet = false) { //Add prop to stage
    let len = this._props.push(prop); //Add prop to props array
    prop.stage = this; //set prop's stage as this stage
    prop.init(quiet); //Init the prop
    return len - 1; //Return the index of the prop
  }

  removeProp(prop, quiet = false) { //Remove by direct comparison
    let index = this._props.indexOf(prop); //Get index of prop

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


  update(dt) { //Cascading update function
    for (var i in this._props) {
      this._props[i].update(dt);
    }

    return true;
  }
}