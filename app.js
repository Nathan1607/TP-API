const express = require('express');
const { Sequelize } = require('sequelize');
const app = express();
const port = 8080;


const sequelize = new Sequelize('liveAddict', 'root', 'rootpwd', {
  host: 'localhost',
  dialect: 'mariadb',
  port: 4000,
  define: {
    freezeTableName: true
  }
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

const Visiteur = sequelize.define('Visiteur', {
  nom: {
    type: Sequelize.STRING,
    allowNull: false
  },
  prenom: {
    type: Sequelize.STRING,
    allowNull: false 
  }
});

console.log(Visiteur === sequelize.models.User);


app.get('/visiteur', async (req, res) => {
  try {
    const Visiteurs = await Visiteur.findAll();
    res.json(Visiteurs);
  } catch (error) {
    console.error('Error retrieving Visiteurs:', error);
    res.status(500).json({ error: 'Failed to retrieve Visiteurs' });
  }
});


app.get('/', (req, res) => {
    res.send('Hello world !!');
});

//Lancement server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
