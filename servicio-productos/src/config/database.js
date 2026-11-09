require('dotenv').config()
const {Sequelize} = require('sequelize')

const sequelize = new Sequelize(
    process.env.DB_NAME, //Nombre de la BD
    process.env.DB_USER, //Usuario (root)
    process.env.DB_PASSWORD, //Contrasenia
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
    }
)

module.exports = sequelize