const moment = require("moment");
const Joi = require('joi');

const db = require("../models")
//const AbstractController = require("./AbstractController");
import AbstractController from "./AbstractController";

const utils = require("../utils");


//class Utils {
//
//  static async hashPassword(plaintext) {
//    console.log("hashPassword", plaintext); // DELETE
//
//    const saltRounds = 10;
//    const hash = await new Promise(function(resolve, reject) {
//      bcrypt.hash(plaintext, saltRounds, (err, hash) => {
//        if (error) {
//          console.error(error);
//          return reject(error);
//        }
//        return resolve(hash);
//      });
//    })
//    console.log("hash", hash);
//    return hash;
//
//  }
//
//}


class PasswordController extends AbstractController {

  _getModel() {
    return db.Password;
  }

  async resetPassword(query) {
    const schema = Joi.object({
      //userId: Joi.string().required(),
      //username: Joi.string().required(),
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
    console.log("checkDuplicatePassword()", query);

    const schema = Joi.object({
      userId: Joi.string().required(),
      hash: Joi.string().required(),
    });
    const validated = Joi.attempt(query, schema);

    //const duplicatePasswordQuery = {
    //  userId,
    //  hash,
    //};
    const duplicatePasswords = await this.find(validated);
    console.log("duplicatePasswords", duplicatePasswords);
    if (duplicatePasswords.length > 0) {
      throw new Error("Password has already been used.  Please enter a different one.");
    }

  }

  async _updateExistingPassword(query) {

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
    console.log("existingPassword", existingPassword);
    if (existingPassword) {
      const values = {
        deactivatedAt: moment().format()
      };
      const updateResult = await this.model.updateOne(values, existingPasswordQuery);
      console.log("updateResult", updateResult);
      return updateResult;
    }
  
  }


  async create(data) {

    const schema = Joi.object({
      userId: Joi.string().required(),
      password: Joi.string().required(),
      resetCode: Joi.string(),
    });
    const validated = Joi.attempt(data, schema);

    const userId = validated.userId;

    const hash = await utils.hashPassword(validated.password);

    const passwordCreateArgs = {
      hash,
      userId,
    }

    await this._checkDuplicatePassword({userId, hash});
    await this._updateExistingPassword({userId});

    //const existingPasswordQuery = {
    //  where: {
    //    userId,
    //    deactivatedAt: null
    //  }
    //};
    //const existingPassword = await this.model.findOne(existingPasswordQuery);
    //console.log("existingPassword", existingPassword);
    //if (existingPassword) {
    //  const values = {
    //    deactivatedAt: moment().format()
    //  };
    //  const updateResult = await this.model.updateOne(values, existingPasswordQuery);
    //  console.log("updateResult", updateResult);
    //}

    console.log("passwordCreateArgs", passwordCreateArgs);
    const createdPassword = await super.create(passwordCreateArgs);
    console.log("createdPassword", createdPassword);
    return createdPassword;

  }


  async findCurrent(query) {

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

  //TODO put in utils
  formatDuration(durationString) {

    if (!(typeof myVar === 'string' || myVar instanceof String)) {
      throw new Error("must be a string");
    }

    var r = new RegExp("([0-9]*)([a-zA-Z]*)")
    var result = r.exec(durationString)
    const data = {
      value: result[1],
      unit: result[2],
    }

    const validUnits = ["years", "y", "months", "M", "weeks", "w", "days", "d", "hours", "h", "minutes", "m", "seconds", "s", "milliseconds", "ms"];
    const schema = Joi.object({
      value: Joi.number().integer().required(),
      unit: Joi.string().required().valid(...validUnits),
    });
    const validated = Joi.attempt(data, schema);

    var ret = moment.duration(result[1], result[2]);
    console.log(ret.humanize())
    return ret;
  
  }

  async checkExpired(query) {

    const defaultExpiry = "6M"
    const schema = Joi.object({
      userId: Joi.string().required(),
      expiry: Joi.string(),
    });
    const validated = Joi.attempt(query, schema);

    const password = await this.findCurrent(validated);

    const duration = this.formatDuration(validated.expiry || defaultExpiry);

    if (moment(password.createdAt).add(duration) < moment()) {
      throw new Error("Password is expired.  Please update to continue");
    }

    return;

    //const schema = Joi.object({
    //  userId: Joi.string().required(),
    //});
    //const validated = Joi.attempt(query, schema);

    //const findArgs = {
    //  where: {
    //    userId: validated.userId,
    //  },
    //  order: [["createdAt", "DESC"]],
    //};
    //const passwords = this.model.findAll(findArgs);

  }


}

//module.exports = PasswordController;
export default PasswordController;

