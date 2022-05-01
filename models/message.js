'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Message.init({
    msg_text: DataTypes.TEXT,
    sent_by: DataTypes.STRING,
    sent_to: DataTypes.STRING,
    received: DataTypes.STRING,
    new: DataTypes.BOOLEAN,
    read: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};