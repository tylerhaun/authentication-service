const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class SmsVerification extends Model {}
  SmsVerification.init({
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
    smsVerificationRequestId: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: "sms_verification",
    timestamps: true,
    paranoid: true,
  });

  return SmsVerification;

}

