
const db = require("../models")

import AbstractController from "./AbstractController";



class AuthorizedIpAddressController extends AbstractController {

  constructor() {
    super(arguments);
  }

  _getModel() {
    return db.AuthorizedIpAddress;
  }


}


export default AuthorizedIpAddressController;

