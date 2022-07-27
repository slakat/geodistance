module.exports = (sequelize, DataTypes) => {
    const location = sequelize.define('location', {
            address: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: "No puede estar vacío",
                    },
                },
            },
            point: {
                type: DataTypes.ARRAY(DataTypes.FLOAT),
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: "No puede estar vacío",
                    },
                }
            },
        }, { underscored: true},
        {
            hooks: {},
        });

    //   point.belongsToMany(models.point, {
    //     through: 'polygon',
    //     foreignKey: 'pointId',
    //   });
    return location;
};
