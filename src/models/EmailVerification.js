const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class EmailVerification extends Model {}
  EmailVerification.init({
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
    emailVerificationRequestId: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: "email_verification",
    timestamps: true,
    paranoid: true,
  });

  return EmailVerification;

}

