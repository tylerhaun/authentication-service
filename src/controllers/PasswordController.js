const moment = require("moment");
const Joi = require('joi');

const db = require("../models")
const AbstractController = require("./AbstractController");

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

  async create(data) {

    const schema = Joi.object({
      password: Joi.string().required(),
      userId: Joi.string().required(),
    });
    const validated = Joi.attempt(data, schema);

    const userId = validated.userId;

    const hash = await utils.hashPassword(validated.password);

    const passwordCreateArgs = {
      hash,
      userId,
    }

    const existingPasswordQuery = {
      where: {
        userId,
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
    }

    console.log("passwordCreateArgs", passwordCreateArgs);
    const createdPassword = await this.model.create(passwordCreateArgs);
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


}

module.exports = PasswordController;

