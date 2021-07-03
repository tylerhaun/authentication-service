const _ = require("lodash");
const Joi = require("joi");
const phone = require("phone");
const moment = require("moment");

const db = require("../models")
const utils = require("../utils");

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

