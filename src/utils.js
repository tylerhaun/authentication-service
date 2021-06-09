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
    console.log("hashPassword", plaintext); // DELETE

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

  //hashPassword: async function hashPassword(plaintext) {
  //  console.log("hashPassword", plaintext); // DELETE

  //  const saltRounds = 10;
  //  const hash = await new Promise(function(resolve, reject) {
  //    bcrypt.hash(plaintext, saltRounds, (err, hash) => {
  //      if (error) {
  //        console.error(error);
  //        return reject(error);
  //      }
  //      return resolve(hash);
  //    });
  //  })
  //  console.log("hash", hash);
  //  return hash;
  //}

  middlewareMethodWrapper(method, inputFields) {
    if (!Array.isArray(inputFields)) {
      inputFields = [inputFields];
    }
    return async function middleware(request, response, next) {
      try {
        console.log("calling", method);
        var data;
        //if (inputField) {
        //  data = await method(request[inputField], request, response, next);
        //}
        //else {
        //  data = await method(request, response, next);
        //}
        const preArgs = inputFields.map(field => request[field])
        const fullArgs = [...preArgs, request, response, next];
        data = await method.apply(null, fullArgs);
        return response.json(data);
      }
      catch(error) {
        console.log("middlewareMethodWrapper error");
        console.error(error);
        return next(error);
      }
    }
  }

};

module.exports = new Utils();

