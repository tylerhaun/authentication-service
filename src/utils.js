const bcrypt = require('bcrypt');


const maxPageSize = 100;
class Utils {

  parsePaginationParams(query) {
    console.log("parsePaginationParams", query);
    const page = query.page || 0;
    const pageSize = query.pageSize || 10;

    const offset = Math.max(0, page * pageSize); // 0 < skip
    const limit = Math.min(Math.max(0, pageSize), maxPageSize); // 0 < pageSize < maxPageSize

    const databaseParams = {
      offset,
      limit,
    };
    console.log("databaseParams", databaseParams);
    return databaseParams;
  }

  async hashPassword(plaintext) {

    const saltRounds = 10;
    const hash = await new Promise(function(resolve, reject) {
      bcrypt.hash(plaintext, saltRounds, (error, hash) => {
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

  async comparePassword(plaintext, hash) {
    console.log("comparePassword", plaintext, hash);

    return new Promise(function(resolve, reject) {

      bcrypt.compare(plaintext, hash, (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      });

    })
  
  }

  middlewareMethodWrapper(method, inputFields) {
    if (!Array.isArray(inputFields)) {
      inputFields = [inputFields];
    }
    return async function middleware(request, response, next) {
      try {
        console.log("calling", method);
        const preArgs = inputFields.map(field => request[field])
        const fullArgs = [...preArgs, request, response, next];
        const data = await method.apply(null, fullArgs);
        return response.json(data);
      }
      catch(error) {
        console.log("middlewareMethodWrapper error");
        console.error(error);
        return next(error);
      }
    }
  }

  restRoutes(routeName, controller /* AbstractController */, app) {

    app.route(`/${routeName}`)
      .post(this.middlewareMethodWrapper(controller.create.bind(controller), "body"))
      .get(this.middlewareMethodWrapper(controller.find.bind(controller), "query"))

    app.route(`/${routeName}/:id`)
      .get(this.middlewareMethodWrapper(controller.findById.bind(controller), "params"))
      .post(this.middlewareMethodWrapper(controller.update.bind(controller), ["params", "body"]))
      .delete(this.middlewareMethodWrapper(controller.delete.bind(controller), "params"))

  }

};

module.exports = new Utils();

