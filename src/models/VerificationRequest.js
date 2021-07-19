const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class VerificationRequest extends Model {}
  VerificationRequest.init({
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
    emailAddressId: {
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
    approvedAt: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: "verifiction_request",
    timestamps: true,
    paranoid: true,
  });

  return VerificationRequest;

}

