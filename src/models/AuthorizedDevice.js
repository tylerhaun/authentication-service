const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class AuthorizedDevice extends Model {}
  AuthorizedDevice.init({
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
    userAgent: {
      type: DataTypes.STRING,
      required: true,
    },
  }, {
    sequelize,
    modelName: "authorized_device",
    timestamps: true,
    paranoid: true,
  });

  return AuthorizedDevice;

}

