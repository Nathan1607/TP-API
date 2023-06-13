const express = require('express');
const { Sequelize } = require('sequelize');
const app = express();
const port = 8080;


const sequelize = new Sequelize('liveAddict', 'root', 'rootpwd', {
  host: 'localhost',
  dialect: 'mariadb',
  port: 4000,
});

async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

connectToDatabase();

app.get('/', (req, res) => {
    res.send('Hello world !!');
});

//Lancement server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
