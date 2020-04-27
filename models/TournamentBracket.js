module.exports = function(sequelize, DataTypes) {
    const TournamentBracket = sequelize.define('TournamentBracket', {
       name: DataTypes.STRING,
       current_round: DataTypes.INTEGER,
       is_complete: {
           type: DataTypes.BOOLEAN,
           defaultValue: false
       },
       winner: DataTypes.STRING
    });

    TournamentBracket.associate = function(models) {
        //each tournamentbracket belongs to a user 
        TournamentBracket.belongsTo(models.User, {
            foreignKey: {
              allowNull: false
            }
        });

        //brackets have many rounds 
        TournamentBracket.hasMany(models.MatchUp,{
            onDelete: "cascade"
        });
        //and many options 
        TournamentBracket.hasMany(models.Option,{
            onDelete: "cascade"
        }); 
    };

    return TournamentBracket;
};