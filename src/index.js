const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");

const sequelize = require("./sequelize");






class Main {

  async main() {

    const db = require("./models");
    await db.init();

    const app = express()

    app.use(function(request, response, next) {
      console.log(Date.now(), request.ip, request.path);
      return next();
    })

    app.get("/ping", function pingHandler(request, response, next) {
      return response.json({pong: true});
    })

    app.use(bodyParser.json())

    //require("./routes/users")(app);
    //require("./routes/passwords")(app);
    //require("./routes/login")(app);
    this.addRoutes(app)

    app.use(function ErrorHandlerMiddleware(error, request, response, next) {
      console.error(error);
      response.status(500)
      return response.json(error);
    })


    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
      if (process.send) {
        process.send("server.started");
      }
    })

  }

  addRoutes(app) {
  
    const files = fs.readdirSync(path.join(__dirname, "routes"))
    console.log("files", files);
    const _this = this;
    files
      .filter(file => file.endsWith(".js"))
      .filter(file => file != "index.js")
      .forEach(file => {
        console.log("file", file);
        //const nameWithoutExt = path.basename(path.basename(file), path.extname(file));
        const requirePath = `./routes/${file}`;
        console.log("requirePath", requirePath);
        require(requirePath)(app);
    })
    console.log(this);

  }

}


const main = new Main();
main.main()
  .catch(error => {
    console.error(error);
  })





