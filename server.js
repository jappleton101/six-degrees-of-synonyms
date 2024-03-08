/* eslint-disable no-param-reassign */
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
import { MongoClient, ServerApiVersion } from 'mongodb';

dotenv.config();
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function getDailyPuzzle(){
  try {
    await client.connect();

    let dailyPuzzle = await client.db("synonym_game").collection("synonym_puzzles").findOne(
      { puzzle_date: new Date("2023-12-11") }
    );
    return dailyPuzzle
  } finally {
    await client.close();
  }
}

async function getRandomPuzzle() {
  try {
    await client.connect();

    let allPuzzles = await client.db("synonym_game").collection("synonym_puzzles").find({}).toArray();
    return allPuzzles[Math.floor(Math.random()*allPuzzles.length)]
  } finally {
    await client.close();
  }
}


const app = express();
app.set('port', (process.env.PORT || 3000));

app.get('/daily', async (req, res) => {
    res.json(await getDailyPuzzle());
});

app.get('/random', async (req, res) => {
  res.json(await getRandomPuzzle());
})

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
