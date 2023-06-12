const express = require('express');
import { Sequelize, DataTypes } from 'sequelize';
const app = express();
const port = 8080;

// Configurer la connexion à la base de données
const sequelize = new Sequelize('nom_base_de_donnees', 'nom_utilisateur', 'mot_de_passe', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306, // Port par défaut pour MySQL
    // Autres options de configuration
  });

app.get('/', (req, res) => {
    res.send('Hello world !!');
});

//Lancement server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
