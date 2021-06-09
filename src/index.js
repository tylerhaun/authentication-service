const bodyParser = require("body-parser");
const express = require("express");

const sequelize = require("./sequelize");






class Main {

  async main() {

    const db = require("./models");
    await db.init();

    const app = express()


    app.use(bodyParser.json())

    require("./routes/users")(app);
    require("./routes/passwords")(app);

    app.use(function(error, request, response, next) {
      console.error(error);
      response.status(500)
      return response.send(error);
    })


    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
      if (process.send) {
        process.send("server.started");
      }
    })

  }

}


const main = new Main();
main.main()
  .catch(error => {
    console.error(error);
  })





