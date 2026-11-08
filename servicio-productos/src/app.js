const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const productoRoutes = require('./routes/producto.route')

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', productoRoutes);

module.exports = app;