const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class SmsVerificationRequest extends Model {}
  SmsVerificationRequest.init({
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
    phoneNumberId: {
      type: DataTypes.STRING,
    },
    code: {
      type: DataTypes.STRING,
    },
    provider: {
      type: DataTypes.STRING,
    },
    externalId: {
      type: DataTypes.STRING,
    },
    expiration: {
      type: DataTypes.DATE,
    },
    approvedAt: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: "sms_verification_request",
    timestamps: true,
    paranoid: true,
  });

  return SmsVerificationRequest;

}

