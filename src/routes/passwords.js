const utils = require("../utils");
const PasswordController = require("../controllers/PasswordController");


const routeName = "passwords"

module.exports = function(app) {

  const passwordController = new PasswordController();

  app.route(`/${routeName}`)
    .post(utils.middlewareMethodWrapper(passwordController.create.bind(passwordController), "body"))
    .get(utils.middlewareMethodWrapper(passwordController.find.bind(passwordController), "query"))

  app.route(`/${routeName}/:id`)
    .get(utils.middlewareMethodWrapper(passwordController.findById.bind(passwordController), "params"))
    .post(utils.middlewareMethodWrapper(passwordController.update.bind(passwordController), ["params", "body"]))
    .delete(utils.middlewareMethodWrapper(passwordController.delete.bind(passwordController), "params"))

}
