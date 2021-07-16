const cuid = require('cuid');
const { Model, DataTypes } = require('sequelize');


module.exports = function(sequelize) {

  class AccessToken extends Model {}
  AccessToken.init({
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
    maxUses: {
      type: DataTypes.INTEGER,
    },
    uses: {
      type: DataTypes.INTEGER,
    },
    expiresAt: {
      type: DataTypes.DATE,
    },
    code: {
      type: DataTypes.STRING,
    },

  }, {
    sequelize,
    modelName: "access_token",
    timestamps: true,
    paranoid: true,
  });

  return AccessToken;

}

