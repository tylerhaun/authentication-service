const moment = require("moment");
const Joi = require('joi');

const db = require("../models")
//const AbstractController = require("./AbstractController");
import AbstractController from "./AbstractController";

const utils = require("../utils");


class PasswordController extends AbstractController {

  _getModel() {
    return db.Password;
  }

  async resetPassword(query) {
    this.logger.log({method: "resetPassword", query});
    const schema = Joi.object({
      email: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const userController = new UserController();
    const user = await userController.find({
      email: validated.email,
    });

    const emailVerificationRequestController = new EmailVerificationRequestController();
    const evr = emailVerificationRequestController.create({
    
    });

  }

  async _checkDuplicatePassword(query) {
    this.logger.log({method: "_checkDuplicatePassword", query});

    const schema = Joi.object({
      userId: Joi.string().required(),
      hash: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const duplicatePasswords = await this.find(validated);
    this.logger.log({duplicatePasswords});
    if (duplicatePasswords.length > 0) {
      throw new Error("Password has already been used.  Please enter a different one.");
    }

  }

  async _updateExistingPassword(query) {
    this.logger.log({method: "_updateExistingPassword", query});

    const schema = Joi.object({
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const existingPasswordQuery = {
      where: {
        userId: validated.userId,
        deactivatedAt: null
      }
    };
    const existingPassword = await this.model.findOne(existingPasswordQuery);
    this.logger.log({existingPassword});
    if (existingPassword) {
      const values = {
        deactivatedAt: moment().format()
      };
      const updateResult = await this.model.updateOne(values, existingPasswordQuery);
      this.logger.log({updateResult});
      return updateResult;
    }

  }


  async create(data) {
    this.logger.log({method: "create"});

    const schema = Joi.object({
      userId: Joi.string().required(),
      password: Joi.string().required(),
      resetCode: Joi.string(),
    });
    const validated = Joi.attempt(data, schema);

    const userId = validated.userId;

    const hash = await utils.hashPassword(validated.password);


    await this._checkDuplicatePassword({userId, hash});
    await this._updateExistingPassword({userId});

    const passwordCreateArgs = {
      hash,
      userId,
    }
    this.logger.log({passwordCreateArgs});
    const createdPassword = await super.create(passwordCreateArgs);
    this.logger.log({createdPassword});
    return createdPassword;

  }


  async findCurrent(query) {
    this.logger.log({method: "findCurrent", query});

    const schema = Joi.object({
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    const findArgs = {
      where: {
        userId: validated.userId,
      },
      order: [
        ["createdAt", "DESC"]
      ]
    };
    const password = await this.model.findOne(findArgs);
    return password;
  
  }

  async checkExpired(query) {
    this.logger.log({method: "checkExpired", query});

    const defaultExpiry = "6M"
    const schema = Joi.object({
      userId: Joi.string().required(),
      expiry: Joi.string(),
    });
    const validated = Joi.attempt(query, schema);

    const password = await this.findCurrent(validated);

    const duration = utils.formatDuration(validated.expiry || defaultExpiry);

    if (moment(password.createdAt).add(duration) < moment()) {
      throw new Error("Password is expired.  Please update to continue");
    }

    return;

  }


}

export default PasswordController;

