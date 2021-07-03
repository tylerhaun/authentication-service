const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class AuthorizedIpAddress extends Model {}
  AuthorizedIpAddress.init({
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
    ipAddress: {
      type: DataTypes.STRING,
      required: true,
    },
  }, {
    sequelize,
    modelName: "authorized_ip_address",
    timestamps: true,
    paranoid: true,
  });

  return AuthorizedIpAddress;

}

