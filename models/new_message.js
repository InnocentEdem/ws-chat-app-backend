'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class New_message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  New_message.init({
    message: DataTypes.TEXT,
    sent_to: DataTypes.STRING,
    sent_by: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'New_message',
  });
  return New_message;
};