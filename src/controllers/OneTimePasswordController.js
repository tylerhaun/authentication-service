const _ = require("lodash");
const Joi = require("joi");
const phone = require("phone");
const moment = require("moment");

const db = require("../models")
const utils = require("../utils");

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

