const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


const types = ["password", "sms", "email"];

module.exports = function(sequelize) {

  class LoginChallenge extends Model {}
  LoginChallenge.init({
    id: {
      primaryKey: true,
      type: DataTypes.STRING,
      defaultValue: function() {
        return cuid();
      },
    },
    userId: {
      type: DataTypes.STRING,
    },
    loginId: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.ENUM(types),
    },
    index: {
      type: DataTypes.INTEGER,
    },
    //completed: {
    //  type: DataTypes.BOOLEAN,
    //},
  }, {
    sequelize,
    modelName: "login_challenge",
    timestamps: true,
    paranoid: true,
  });

  return LoginChallenge;

}

