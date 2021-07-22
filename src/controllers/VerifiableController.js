const Joi = require("joi");
const moment = require("moment");

const db = require("../models")
const utils = require("../utils");

import AbstractController from "./AbstractController";


class VerifiableController extends AbstractController {

  constructor() {
    super(arguments);
    this.logger = this.logger.child({parent: "VerifiableController"})
  }

  async startVerification(query) {
    this.logger.log({method: "startVerification", query});

    const schema = Joi.object({
      id: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const object = await this.findOne({id: validated.id});
    this.logger.log({object});

    const code = utils.randomString(60)
    this.logger.log({code});

    const vrCreateArgs = {
      userId: object.userId,
      emailAddressId: object.id,
      phoneNumberId: object.id,
      code,
    }
    this.logger.log({vrCreateArgs});
    const verificationRequestController = new this._verificationRequestController();
    //console.log({verificationRequestController, "this._verificationRequestController": this._verificationRequestController, ".create": verificationRequestController.create});
    const createdVr = await verificationRequestController.create(vrCreateArgs);
    this.logger.log({createdVr});
    return createdVr;

  }

  async verify(query, data) {
    this.logger.log({method: "verify", data});

    const schema = Joi.object({
      query: Joi.object({
        id: Joi.string().required()
      }),
      data: Joi.object({
        code: Joi.string().required(),
        userId: Joi.string().required(),
      }),
    });
    const validated = Joi.attempt({query, data}, schema);

    // The code used for email verifications is big and unlikely to happen twice, so simple logic can be used here.
    // If the code is expired, none will be found and user gets an error to retry
    const expiry = "1m"
    const expiryMoment = moment().subtract(utils.formatDuration(expiry));
    const verificationRequestController = new this._verificationRequestController();
    const vrFindArgs = {
      code: validated.data.code,
      createdAt: {
        [Symbol.for("gt")]: expiryMoment,
      }
    };
    if (validated.data.userId) {
      Object.assign(vrFindArgs, {userId: validated.data.userId});
    }
    this.logger.log({vrFindArgs});
    const vr = await verificationRequestController.findOne(vrFindArgs);
    this.logger.log({vr});
    if (!vr) {
      throw new Error("No code found");
    }

    await verificationRequestController.approve({id: vr.id, userId: validated.data.userId});

    const verifiableId = vr.emailAddressId || vr.phoneNumberId;
    this.logger.log({verifiableId});
    const updateResult = await this.update({
      id: verifiableId,
    }, {
      verified: true,
    });
    this.logger.log({updateResult});

    const updatedVerifiableObject = await this.findOne({id: verifiableId});
    return updatedVerifiableObject;
  
  }
  
}

export default VerifiableController;

