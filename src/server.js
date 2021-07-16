const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");

import { errorHandlerMiddleware } from "./http-errors";

const logger = require("./Logger");



//const Transport = require('winston-transport');
//
//class CustomConsoleTransport extends Transport {
//  constructor(opts) {
//    super(opts);
//    }
//
//  log(info, callback) {
//    setImmediate(() => {
//      this.emit('logged', info);
//    });
//    console.log(JSON.stringify(info));
//    callback();
//  }
//};
//      
//
//
//const logger = winston.createLogger({
//  level: 'info',
//  format: winston.format.json(),
//  defaultMeta: {
//    level: "info",
//    service: "authentication-service",
//  },
//  transports: [
//    //new winston.transports.Console({
//    //  format: winston.format.simple(),
//    //})
//    new CustomConsoleTransport({
//      //format: winston.format.simple(),
//    })
//  ],
//});




class Main {

  async main() {

    const db = require("./models");
    await db.init();

    const app = express();

    app.use(function(request, response, next) {
      const requestData = {
        timestamp: Date.now(),
        ip: request.ip,
        method: request.method,
        path: request.path,
        headers: request.headers
      };
      //console.log();
      logger.log({message: "requestLogger", data: requestData})
      return next();
    })

    app.get("/ping", function pingHandler(request, response, next) {
      return response.json({pong: true});
    })

    app.use(bodyParser.json())

    this.addRoutes(app)

    app.use(errorHandlerMiddleware)
    //app.use(function ErrorHandlerMiddleware(error, request, response, next) {
    //  console.error(error);
    //  response.status(500)
    //  return response.json(error);
    //})


    const port = process.env.PORT;
    const server = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
      if (process.send) {
        process.send("server.started");
      }
    })

    return {app, server};

  }

  addRoutes(app) {
  
    const files = fs.readdirSync(path.join(__dirname, "routes"))
    console.log("files", files);
    const _this = this;
    files
      .filter(file => file.endsWith(".js"))
      .filter(file => file != "index.js")
      .forEach(file => {
        //const nameWithoutExt = path.basename(path.basename(file), path.extname(file));
        const requirePath = `./routes/${file}`;
        console.log("requiring", file);
        require(requirePath)(app);
    })

  }

}


const main = new Main();
module.exports = main.main()
  .catch(error => {
    console.error(error);
  })


