module.exports = (sequelize, DataTypes) => {
    const query = sequelize.define('query', {
        origin: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "No puede estar vacío",
                },
            },
        },
        destination: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "No puede estar vacío",
                },
            },
        },
        startPoint: {
            type: DataTypes.ARRAY(DataTypes.FLOAT),
            allowNull: true,
        },
        endPoint: {
            type: DataTypes.ARRAY(DataTypes.FLOAT),
            allowNull: true,
        },
        distance: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, { underscored: true},
        {
        hooks: {},
    });

    // query.associate = function associate(models) {
    //   query.belongsTo(Point, { as:'pointA', foreignKey: 'point_a_id'});
    //   query.belongsTo(Point, { as:'pointB', foreignKey: 'point_b_id'});
    return query;
};
