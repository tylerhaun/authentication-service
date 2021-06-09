const _ = require("lodash");
const moment = require("moment");
const bcrypt = require('bcrypt');
const Joi = require('joi');

const Password = require("../models/Password");


// TODO breakout into different file
const maxPageSize = 100;
const utils = {
  parsePaginationParams: function parsePaginationParams(query) {
    console.log("parsePaginationParams", query);
    const params = qs.parse(query);
    const { page, pageSize } = params;

    const skip = Math.max(0, page * pageSize); // 0 < skip
    const limit = Math.min(Math.max(0, pageSize), maxPageSize); // 0 < pageSize < maxPageSize

    const databaseParams = {
      skip,
      limit,
    };
    console.log("databaseParams", databaseParams);
    return databaseParams;
  },
  hashPassword: async function hashPassword(plaintext) {
    console.log("hashPassword", plaintext); // DELETE

    const saltRounds = 10;
    const hash = await new Promise(function(resolve, reject) {
      bcrypt.hash(plaintext, saltRounds, (err, hash) => {
        if (error) {
          console.error(error);
          return reject(error);
        }
        return resolve(hash);
      });
    })
    console.log("hash", hash);
    return hash;

  }
};

const routeName = "passwords"

module.exports = function(app) {

  app.route(`/${routeName}`)
    .post(async function(request, response, next) {
      try {

        const plaintext = request.body.password;
        const userId = request.body.userId;


        const schema = Joi.object({
          password: Joi.string().required(),
          userId: Joi.string().required(),
        });
        const validationResult = Joi.validate(yourObject, schema);
        console.log("validationResult", validationResult);

        const hash = await utils.hashPassword(plaintext);

        const passwordCreateArgs = {
          hash,
          userId,
        }

        const existingPasswordQuery = {
          userId,
          deactivatedAt: null
        };
        const existingPassword = await Password.findOne(existingPasswordQuery);
        console.log("existingPassword", existingPassword);
        if (existingPassword) {
          const updateResult = await Password.updateOne(existingPasswordQuery, {
            deactivatedAt: moment().format()
          });
          console.log("updateResult", updateResult);
        }

        console.log("passwordCreateArgs", passwordCreateArgs);
        const createdPassword = await Password.create(passwordCreateArgs);
        console.log("createdPassword", createdPassword);
        return response.json(createdPassword);
      }
      catch(error) {
        console.error(error);
        return next(error);
      }
    })

    .get(async function(request, response, next) {
      var queryParams;
      queryParams = qs.parse(request.query);
      queryParams = _.pick(query, ["id", "userId", "deactivatedAt", "createdAt"]);
      console.log("queryParams", queryParams);
      const passwordQuery = {
        where: queryParams,
      };
      Object.assign(passwordQuery, utils.parsePaginationParams());
      console.log("passwordQuery", passwordQuery);
      const password = Password.findAll(passwordQuery);
      return response.json(password);
    })

}
