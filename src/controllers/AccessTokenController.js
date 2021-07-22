const Joi = require("joi").extend(require('@joi/date'))
const moment = require("moment");

const db = require("../models")
const utils = require("../utils");

import HttpError from "../http-errors";
import AbstractController from "./AbstractController";


class AccessTokenController extends AbstractController {

  constructor() {
    super(arguments);
  }

  _getModel() {
    return db.AccessToken;
  }

  async create(data) {
    this.logger.log({method: "create", data});

    const schema = Joi.object({
      userId: Joi.string().required(),
      maxUses: Joi.number().integer(),
      expiresAt: Joi.date().format("YYYY-MM-DD").greater('now'),
    });
    const validated = Joi.attempt(data, schema);

    const code = `A${utils.randomString(40)}`;
    const createData = {
      userId: validated.userId,
      maxUses: validated.maxUses,
      uses: 0,
      expiresAt: validated.expiresAt,
      code,
    }
    return super.create(createData);
    
  }


  async redeem(query) {
    this.logger.log({method: "redeem", query});

    const schema = Joi.object({
      code: Joi.string().regex(/A[a-zA-Z0-9]{40}/).required(),
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const accessToken = await this.findOne({userId: validated.userId, code: validated.code});

    if (moment(accessToken.expiresAt) < moment()) {
      throw new HttpError({message: "Access token has expired", status: 401});
    }
    if ((accessToken.uses >= accessToken.maxUses) && accessToken.maxUses != 0) {
      throw new HttpError({message: "Access token exceeds max usage", status: 401})
    }

    const updateResult = await this.update({
      id: accessToken.id
    }, {
      uses: accessToken.uses + 1
    })
    this.logger.log({updateResult});

    const updatedAccessToken = await this.findOne({id: accessToken.id}); // TODO just return the other accessToken with locally updated fields

    return updatedAccessToken;

  }


}


export default AccessTokenController;

