//name of option
//id of tournament bracket 
//belongs to tournamentbracket 
module.exports = function(sequelize, DataTypes) {
    const Option = sequelize.define('Option', {
        name: DataTypes.STRING
    });

    Option.associate = function(models) {
        //each option belongs to a tournamentbracket 
        Option.belongsTo(models.TournamentBracket, {
            foreignKey: {
              allowNull: false
            }
        });
    };

    return Option;
};