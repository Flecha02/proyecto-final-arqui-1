require('dotenv').config();
const { Sequelize } = require('sequelize');

// Usamos la URI directa de Supabase
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
    family: 4, // Fuerza IPv4
    ssl: {
        require: true,
        rejectUnauthorized: false // Necesario para conexiones SSL externas en Supabase
        }
    }
});

module.exports = sequelize;