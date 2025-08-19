const cors = require('cors');
const fs = require('fs');
const express = require('express');
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL, // ustaw w Renderze w Environment Variables
  ssl: { rejectUnauthorized: false } // wymagane w Render
});


async function init() {
  await client.connect();




const app = express();
app.use(cors());
app.use(express.json());
//wartość poppulacji wzięta z dnia 18.08.2025r.
let deltacount = 0.0;
let deltadeath = 0.0;
//const count = [0,0,0,0,false,new Date()]; // liczba w pamięci
let ran=0;
  // Tworzymy tabelę, jeśli nie istnieje
  await client.query(`
    CREATE TABLE IF NOT EXISTS count_data (
      id SERIAL PRIMARY KEY,
      values_json JSON NOT NULL
    )
  `);

  // Wczytujemy dane, jeśli są zapisane
  const res = await client.query('SELECT values_json FROM count_data WHERE id = 1');
  if (res.rows.length > 0) {
    count = res.rows[0].values_json;
    console.log('📥 Wczytano dane z bazy:', count);
  } else {
    // Pierwsze uruchomienie — wstaw pusty rekord
    await client.query('INSERT INTO count_data (id, values_json) VALUES (1, $1)', [count]);
  }
}

// Funkcja zapisu
async function saveData() {
  await client.query('UPDATE count_data SET values_json = $1 WHERE id = 1', [count]);
  console.log('💾 Dane zapisane do bazy:', new Date().toLocaleString());
}

// Uruchamiamy inicjalizację
init();



setInterval(() => {
  deltacount=count[0]*5*Math.pow(10,-10);
  deltadeath=count[0]*2.1*Math.pow(10,-10);
  while (deltacount>=0.5){
    ran=Math.random();
    if (ran<0.5){
        count[0]++;
        count[1]++;
    }
    deltacount-=0.5;
  }
  ran=Math.random();
  if(ran<deltacount){
    count[0]++;
    count[1]++;
  }

  while (deltadeath>=0.5){
    ran=Math.random();
    if (ran<0.5){
      count[0]--;
      count[2]++;
    }
    deltadeath-=0.5;
  }
  ran=Math.random();
  if(ran<deltadeath){
    count[0]--;
    count[2]++;
  }

}, 1000); // 1000 ms = 1 sekunda

app.get("/count", (req, res) => {
  if (count[0]<=0){
    if(count[4]==false){
      count[4]=true;
      count[5]=new Date().toString();
    }
    count[0]=0;
  }
    res.json({ count });
});


app.post("/click", (req, res) => {
    if (count[0]>0){
      count[0]--;
      count[3]++;
    }
    else{
      if(count[4]==false){
        count[4]=true;
        count[5]=new Date().toString();
      }
      count[0]=0
    }
    res.json({ count: count[0] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nasłuchuję na porcie ${PORT}`));

// Zapis co 10 minut
setInterval(saveData, 10 * 60 * 1000);


