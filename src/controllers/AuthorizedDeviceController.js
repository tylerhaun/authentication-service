
const db = require("../models")

import AbstractController from "./AbstractController";



class AuthorizedDeviceController extends AbstractController {

  constructor() {
    super(arguments);
  }

  _getModel() {
    return db.AuthorizedDevice;
  }


}


export default AuthorizedDeviceController;

