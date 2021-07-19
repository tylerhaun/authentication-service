const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class EmailAddress extends Model {}
  EmailAddress.init({
    id: {
      primaryKey: true,
      type: DataTypes.STRING,
      defaultValue: function() {
        return cuid();
      },
    },
    userId: {
      type: DataTypes.STRING,
      required: true,
    },
    emailAddress: {
      type: DataTypes.STRING,
      required: true,
    },
    verifiedAt: {
      type: DataTypes.DATE,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
    },
  }, {
    sequelize,
    modelName: "email",
    timestamps: true,
    paranoid: true,
  });

  return EmailAddress;

}

