const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class EmailVerificationRequest extends Model {}
  EmailVerificationRequest.init({
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
    email: {
      type: DataTypes.STRING,
    },
    code: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: "email_verification_request",
    timestamps: true,
    paranoid: true,
  });

  return EmailVerificationRequest;

}

