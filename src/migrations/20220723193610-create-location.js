module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        unique: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      point: {
        type: Sequelize.ARRAY(Sequelize.FLOAT),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }, {
          uniqueKeys: {
            actions_unique: {
              fields: ["address"],
            },
          },
        }
      )},
  down: (queryInterface) => queryInterface.dropTable('locations'),
};
