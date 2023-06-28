const express = require('express');
const { Sequelize } = require('sequelize');
const { Issuer, custom } = require('openid-client');
const session = require('express-session');
const app = express();
const port = 3000;

const issuerURL = 'https://dev-8wn2ud4lbi0wt6p2.us.auth0.com/';
const clientID = '649ca7e695ee5d0d86f10ebb';
const clientSecret = 'RS256';
const redirectURL = 'http://localhost:3000/auth/openid/callback';

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
  idVisiteur: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: Sequelize.STRING,
    allowNull: false
  },
  prenom: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  age: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  adresse: {
    type: Sequelize.STRING,
    allowNull: true
  },
  idParrain: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  idVille: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
}, {
  timestamps: false //Désactivation des colonnes 'createdAt' et 'updatedAt'
});

console.log(Visiteur === sequelize.models.User);

// Configuration de la session
app.use(
  session({
    secret: 'votre_secret',
    resave: false,
    saveUninitialized: true
  })
);

app.get('/auth/openid', async (req, res) => {
  try {
    const issuer = await Issuer.discover(issuerURL);
    const client = new issuer.Client({
      client_id: clientID,
      client_secret: clientSecret
    });

    // Générez un état aléatoire pour protéger contre les attaques CSRF
    const state = generateRandomState();

    // Créez l'URL de l'authentification OpenID Connect avec les paramètres requis
    const authorizationUrl = client.authorizationUrl({
      redirect_uri: redirectURL,
      scope: 'openid profile email',
      state
    });

    // Enregistrez l'état dans la session pour vérification ultérieure
    req.session.openidState = state;

    // Redirigez l'utilisateur vers l'URL d'authentification OpenID Connect
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error('Erreur lors de l\'authentification OpenID:', error);
    res.status(500).json({ error: 'Échec de l\'authentification OpenID' });
  }
});

app.get('/auth/openid/callback', async (req, res) => {
  try {
    const issuer = await Issuer.discover(issuerURL);
    const client = new issuer.Client({
      client_id: clientID,
      client_secret: clientSecret
    });

    const params = client.callbackParams(req);

    // Vérifiez l'état pour prévenir les attaques CSRF
    if (params.state !== req.session.openidState) {
      throw new Error('Invalid state');
    }

    // Échangez le code d'autorisation contre un jeton d'accès et d'autres informations
    const tokenSet = await client.callback(redirectURL, params, {
      state: req.session.openidState,
      nonce: generateRandomNonce()
    });

    // Utilisez les informations du jeton pour authentifier l'utilisateur
    const userInfo = await client.userinfo(tokenSet.access_token);

    // Effectuez les actions nécessaires avec les informations de l'utilisateur
    // Par exemple, enregistrez l'utilisateur dans la base de données

    // Marquez l'utilisateur comme authentifié dans la session
    req.session.isAuthenticated = true;

    // Redirigez l'utilisateur vers la page souhaitée après l'authentification réussie
    res.redirect('/visiteur');
  } catch (error) {
    console.error('Erreur lors du rappel OpenID:', error);
    res.status(500).json({ error: 'Échec de l\'authentification OpenID' });
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/auth/openid');
}

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

function generateRandomState() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let state = '';

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    state += characters[randomIndex];
  }

  return state;
}

function generateRandomNonce() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';

  for (let i = 0; i < 16; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    nonce += characters[randomIndex];
  }

  return nonce;
}
