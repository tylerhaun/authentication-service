const utils = require("../utils");
const LoginChallengeController = require("../controllers/LoginChallengeController");


const routeName = "login-challenges"

module.exports = function(app) {

  const controller = new LoginChallengeController();
  utils.restRoutes(routeName, controller, app);

  app.route(`/${routeName}/:id/complete`)
      .post(utils.middlewareMethodWrapper(controller.complete.bind(controller), ["params", "body"]))

}
