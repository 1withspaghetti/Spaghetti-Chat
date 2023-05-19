import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

if (!process.env.DATABASE_URL) console.warn("No DATABASE_URL provided, defaulting to sqlite://data.db")
const db = new Sequelize(process.env.DATABASE_URL || "sqlite://data.db", {logging: false});

(async () => {
    await db.authenticate();
    await db.sync({ alter: true });

    console.log('User SQL Database has been connected');
    setInterval(()=>{
        TokenBlacklist.destroy({where: {expires: { $lt: Date.now() }}}).catch((err)=>{
            console.error("Error removing expired jwt ids: ", err);
        })
    }, 60000);
})();

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: number;
    declare email: string;
    declare username: string;
    declare salt: Buffer;
    declare hash: Buffer;
    declare loginAttemptNext: number;
}
User.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    username: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    salt: {
        type: DataTypes.BLOB,
        allowNull: false
    },
    hash: {
        type: DataTypes.BLOB,
        allowNull: false
    },
    loginAttemptNext: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0
    }
}, {sequelize: db});

export class TokenBlacklist extends Model<InferAttributes<TokenBlacklist>, InferCreationAttributes<TokenBlacklist>> {
    declare id: Buffer;
    declare expires: number;
}
TokenBlacklist.init({
    id: {
        type: DataTypes.BLOB,
        primaryKey: true
    },
    expires: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
    }
}, {
    indexes: [{
        unique: true,
        fields: ['id']
    }], 
    sequelize: db,
    timestamps: false,
    freezeTableName: true
});
