const Sequelize = require('sequelize');
const sequelize = new Sequelize('new_schema','root','sp.191273',{
    dialect:'mysql' ,
    host:'localhost',
})

module.exports = sequelize ;