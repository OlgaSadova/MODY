module.exports = function(sequelize, DataTypes) {
    const MatchUp = sequelize.define('MatchUp', {
       round: DataTypes.INTEGER,
       bracket: DataTypes.INTEGER, 
       option1: DataTypes.STRING,
       option2: DataTypes.STRING,
       option1_votes: DataTypes.INTEGER,
       option2_votes: DataTypes.INTEGER,
       winner: DataTypes.STRING
    });

    MatchUp.associate = function(models) {
        MatchUp.belongsTo(models.TournamentBracket, {
            foreignKey: {
              allowNull: false
            }
        });
        
    };


    return MatchUp;
};