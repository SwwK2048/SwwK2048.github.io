const cors = require('cors');
const fs = require('fs');
const express = require('express');
const { Client } = require('pg');


// Lepiej trzymać dane dostępowe w zmiennych środowiskowych, ale na początek:
const connectionString = 'postgresql://count_db_user:CWIVhCDzyu6wJpcCGBS6rw067Uh0e25J@dpg-d2i8bap5pdvs73evk21g-a.frankfurt-postgres.render.com/count_db';
//let count = [0, 0, 0, 0, false, new Date()]; 
async function fetchData() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Połączono z bazą danych');

    const res = await client.query('SELECT * FROM count_data;');
    console.log('📊 Dane z bazy:', res.rows);

    if (res.rows.length > 0) {
      const row = res.rows[0];
      count = [
        Number(row.col1),
        Number(row.col2),
        Number(row.col3),
        Number(row.col4),
        row.col5,
        new Date(row.col6)
      ];
    }
  } catch (err) {
    console.error('❌ Błąd podczas pobierania danych:', err);
  } finally {
    await client.end();
  }
}

async function saveData() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const query = `
      UPDATE count_data
      SET col1 = $1,
          col2 = $2,
          col3 = $3,
          col4 = $4,
          col5 = $5,
          col6 = $6
    `;

    await client.query(query, [
      count[0],
      count[1],
      count[2],
      count[3],
      count[4],
      count[5]
    ]);

    console.log("💾 Zapisano dane do bazy");
  } catch (err) {
    console.error("❌ Błąd zapisu do bazy:", err);
  } finally {
    await client.end();
  }
}

const app = express();
app.use(cors());
app.use(express.json());
//wartość poppulacji wzięta z dnia 18.08.2025r.
let deltacount = 0.0;
let deltadeath = 0.0;
//const count = [0,0,0,0,false,new Date()]; // liczba w pamięci
let ran=0;



fetchData();

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
setInterval(saveData, 60 * 1000); // co 60 sekund
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nasłuchuję na porcie ${PORT}`));




