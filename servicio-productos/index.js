require('dotenv').config();
const app = require('./src/app')
const PUERTO = process.env.PORT || 3001;
const sequelize = require('./src/config/database')

async function iniciarAplicacion() {
    try {
        await sequelize.authenticate()
        console.log("Conexion a la base de datos establecida")

        await sequelize.sync();
        console.log("Modelos sincronizados");
        
        app.listen(PUERTO, () => console.log("AHORA ESTAMOS EN SEQUELIZE EN EL PUERTO: " + PUERTO))
    } catch (e) {
        console.error("Hay un error: " + e)
    }
}

iniciarAplicacion()