const Joi = require("joi");
const moment = require("moment");

const utils = require("../utils");
const db = require("../models")
//const logger = require("../Logger").child({class: "VerificationRequestController"});

import AbstractController from "./AbstractController";


class VerificationRequestController extends AbstractController {

  _getModel() {
    return db.VerificationRequest;
  }

  //get _providerType() {
  //  throw new Error("Must override");
  //}

  //async _send(data) {

  //  const schema = Joi.object({
  //    user: Joi.object().required(),
  //    code: Joi.string().required(),
  //  });
  //  const validated = Joi.attempt(data, schema);
  //  throw new Error("Must override");
  //  return {
  //    messageId: ""
  //  };
  //}

  async create(data) {
    this.logger.log({method: "create", data})

    const schema = Joi.object({
      userId: Joi.string().required(),
      emailAddressId: Joi.string(),
      phoneNumberId: Joi.string(),
      subject: Joi.string(),
      text: Joi.string(),
      code: Joi.string(),
      expiration: Joi.string(),
      loginChallengeId: Joi.string(),
    });
    const validated = Joi.attempt(data, schema);

    await this._assertCreateRecentLimit({userId: validated.userId}, 2);

    const UserController = require("./UserController").default; // hack for circular dependency
    const userController = new UserController();
    const user = await userController.findOne({
      id: validated.userId,
    });
    this.logger.log({user});

    const code = validated.code || utils.randomString(6);

    const sendArgs = {code, user};
    const sendResult = await this._send(sendArgs);
    this.logger.log({sendResult});


    const expiration = validated.expiration ? moment(validated.expiration) : moment().add(1, "minute");
    const vrCreateArgs = {
      ...validated,
      code,
      provider: this._providerType,
      externalId: sendResult.messageId,
      expiration,
    };
    this.logger.log({vrCreateArgs});
    const createdVr = await super.create(vrCreateArgs);
    this.logger.log({createdVr});

    return createdVr;

  }

  async _assertCreateRecentLimit(query, limit) {
    this.logger.log({method: "_assertCreateRecentLimit", query, limit});
    limit = limit || 2;

    const schema = Joi.object({
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const recentEvrs = await this.find({
      userId: validated.userId,
      approvedAt: null,
      createdAt: {
        [Symbol.for("gt")]: moment().subtract(1, "minute")
      }
    })
    this.logger.log({recentEvrs});
    if (recentEvrs.length > limit) {
      throw new Error("Too many requests.  Please try again later");
    }
  
  }


  async approve(data) {
    this.logger.log({method: "approve", data});

    const schema = Joi.object({
      id: Joi.string().required(),
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const evr = await this._getAndAssertApproveExpiration({id: validated.id, userId: validated.userId})
    this.logger.log({evr});

    const updateEvrQuery = {
      id: evr.id
    };
    const updateEvrData = {
      approvedAt: moment(),
    };
    this.logger.log({updateEvrQuery, updateEvrData});
    const updateResult = await this.update(updateEvrQuery, updateEvrData)
    this.logger.log({updateResult});
    const updatedEvr = await this.find(updateEvrQuery);
    this.logger.log({updatedEvr});
    return updatedEvr;

  }

  async _getAndAssertApproveExpiration(query) {
    this.logger.log({method: "_getAndAssertApproveExpiration", query});

    const vrFindArgs = {
      id: query.id,
      userId: query.userId,
    };
    this.logger.log({vrFindArgs});
    const vrs = await this.find(vrFindArgs)
    this.logger.log({vrs});
    if (vrs.length == 0) {
      throw new Error("Invalid code");
    }
    const activeVrs = vrs.filter(vr => moment(vr.createdAt) > moment().subtract(1, "minute"))
    this.logger.log({activeVrs});
    if (activeVrs.length == 0 && vrs.length > 0) {
      throw new Error("Verification request has expired");
    }
    const vr = activeVrs[0];
    if (vr.approvedAt != null) {
      throw new Error("Code has already been used");
    }
    this.logger.log({vr});
    return vr;

  }

}

export default VerificationRequestController;


