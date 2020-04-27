const bcrypt = require("bcrypt"); 

module.exports = function(sequelize, DataTypes) {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8]
            }
        }
    });

    //encrypt password
    User.beforeCreate(function(user) {
        user.password = bcrypt.hashSync(user.password,bcrypt.genSaltSync(10),null); 
    })

    //each user can have many tournament brackets
    User.associate = function(models) {
        User.hasMany(models.TournamentBracket);
    };

   

    return User;
};