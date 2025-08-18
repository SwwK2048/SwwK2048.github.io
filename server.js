const cors = require('cors');
const fs = require('fs');
const express = require('express');

const app = express();
app.use(cors());
app.use(express.json());
//wartość poppulacji wzięta z dnia 18.08.2025r.
let deltacount = 0.0;
let deltadeath = 0.0;
//const count = [0,0,0,0,false,new Date()]; // liczba w pamięci
let ran=0;
const zawartosc = fs.readFileSync('count.json', 'utf8');

// Załaduj zapisany licznik
const count = JSON.parse(zawartosc)

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

app.listen(3000, () => console.log("Serwer działa na porcie 3000"));

// Funkcja zapisu przy zamykaniu
function zapiszDane() {
  fs.writeFileSync('count.json', JSON.stringify(count, null, 2), 'utf8');
  console.log("Dane zapisane ✅");
}

process.on('SIGINT', () => {
  zapiszDane();
  process.exit();
});

process.on('SIGTERM', () => {
  zapiszDane();
  process.exit();
});

process.on('exit', () => {
  zapiszDane();
});