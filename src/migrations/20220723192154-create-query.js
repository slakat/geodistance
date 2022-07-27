module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('queries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        unique: true,
      },
      origin: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      destination: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      start_point: {
        type: Sequelize.ARRAY(Sequelize.FLOAT) ,
      },
      end_point: {
        type: Sequelize.ARRAY(Sequelize.FLOAT) ,
      },
      distance: {
        type: Sequelize.FLOAT
      },
      ip: {
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  ,
  down: (queryInterface) =>
    queryInterface.dropTable('queries')
  ,
};
