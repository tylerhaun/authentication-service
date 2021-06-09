const _ = require("lodash");
const Joi = require('joi');

const db = require("../models")

const routeName = "users";

module.exports = function(app) {

  app.route(`/${routeName}`)

    .get(async function(request, response, next) {
      try {
        const users = await db.User.findAll({limit: 10})
        return response.json(users);
      }
      catch(error) {
        console.error(error);
        return next(error);
      }
    })

    .post(async function(request, response, next) {
      try {

        const schema = Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required(),
          email: Joi.string(),
          phoneNumber: Joi.string(),
        });
        const userCreateArgs = Joi.attempt(request.body, schema);

        const createPasswordArgs = {
        
        };
        const createdPassword = db.Password.create() // need to break of into separate class

        console.log("userCreateArgs", userCreateArgs);
        const createdUser = await db.User.create(userCreateArgs);
        console.log("createdUser", createdUser);
        return response.json(createdUser);
      }
      catch(error) {
        console.error(error);
        return next(error);
      }
    })


  app.route(`/${routeName}/:id`)
    .get(async function(request, response, next) {
      const id = request.params.id;
      const user = db.User.findOne({id})
      return response.json(user);
    })
    .post(async function(request, response, next) {
      return response.json();
    })
    .put(async function(request, response, next) {
      return response.json();
    })
    .delete(async function(request, response, next) {
      return response.json();
    })

}
