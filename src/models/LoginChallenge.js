const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


//const types = ["password", "sms", "email", "question", "tpa"]; // tpa - third party authenticator

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
      type: DataTypes.STRING,
      //type: DataTypes.ENUM(types),
    },
    index: {
      type: DataTypes.INTEGER,
    },
    completedAt: {
      type: DataTypes.DATE,
    },
    smsVerificationRequestId: {
      type: DataTypes.STRING,
    },
    emailVerificationRequestId: {
      type: DataTypes.STRING,
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

