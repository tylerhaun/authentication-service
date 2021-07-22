
const db = require("../models")

import AbstractController from "./AbstractController";
import AccessTokenController from "./AccessTokenController";



class OneTimePasswordController extends AccessTokenController {

  constructor() {
    super(arguments);
  }

  _getModel() {
    return db.AccessToken;
  }

  async create(data) {
    data.maxUses = 1;
    return super.create(data);
  }


}


export default OneTimePasswordController;

