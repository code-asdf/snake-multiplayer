let socket = io();
let s;
let scl = 15;

let pinkFood = [];
let greenFood = [];
let purpleFood = [];

/*
let button = document.getElementById("button");
let text = document.getElementById("text");
let div = document.getElementsByClassName("input");
*/



function setup() {
    createCanvas(screen.width,screen.height);
    s = new Snake();
    frameRate(20);

    pinkFood[0] = pickLocation();
    pinkFood[1] = pickLocation();
    pinkFood[2] = pickLocation();
    pinkFood[3] = pickLocation();
    pinkFood[4] = pickLocation();

    greenFood[0] = pickLocation();
    greenFood[1] = pickLocation();
    greenFood[2] = pickLocation();

    purpleFood[0] = pickLocation();
    purpleFood[1] = pickLocation();
    purpleFood[2] = pickLocation();
}

function pickLocation() {
    var cols = floor(width/scl);
    var rows = floor(height/scl);
    let food = createVector(floor(random(cols)), floor(random(rows)));
    food.mult(scl);
    return food;
}

function draw() {
    background(51);
    if(s.death()){
        socket.emit("update",{
            currentScore : s.currentScore,
            currentMultiplier: s.currentMultiplier
        })
        console.log("current multiplier :" + s.currentMultiplier);
        console.log("current score :"+s.currentScore);
    }
    s.update();
    s.show();
    for(let i=0;i<5;i++) {
        if (s.eat(pinkFood[i])) {
            pinkFood[i] = pickLocation();
            s.currentScore += s.currentMultiplier;

            console.log("current multiplier :" + s.currentMultiplier);
            console.log("current score :" + s.currentScore);
            socket.emit("update", {
                currentScore: s.currentScore,
                currentMultiplier: s.currentMultiplier
            })
        }
    }
    for(let i=0;i<3;i++) {
        if (s.eat(greenFood[i])) {
            greenFood[i] = pickLocation();
            s.currentScore += 2 * s.currentMultiplier;
            console.log("current multiplier :" + s.currentMultiplier);
            console.log("current score :" + s.currentScore);
            socket.emit("update", {
                currentScore: s.currentScore,
                currentMultiplier: s.currentMultiplier
            })
        }
    }
    for(let i=0;i<3;i++) {
        if (s.eat(purpleFood[i])) {
            purpleFood[i] = pickLocation();
            s.currentMultiplier+=1;
            console.log("current multiplier :" + s.currentMultiplier);
            console.log("current score :" + s.currentScore);
            socket.emit("update", {
                currentScore: s.currentScore,
                currentMultiplier: s.currentMultiplier
            })
        }
    }

    fill(255,0,100);
    for(let i=0;i<5;i++)
    rect(pinkFood[i].x,pinkFood[i].y,scl,scl);
    fill(0,178,0);
    for(let i=0;i<3;i++)
    rect(greenFood[i].x,greenFood[i].y,scl,scl);
    fill(138,43,226);
    for(let i=0;i<3;i++)
        rect(purpleFood[i].x,purpleFood[i].y,scl,scl);
}

socket.on("ask-username",(message) => {
    document.getElementById("input").style.visibility = "visible"
    let btn = document.getElementById("btn")
    document.getElementById("username").value = ""
    btn.onclick = () => {
        document.getElementById("init").classList.remove("blurr")
        document.getElementById("defaultCanvas0").style.filter = "none"
        message.name = document.getElementById("username").value
        document.getElementById("input").style.visibility = "hidden"
        socket.emit("username",message)
    }
})

socket.on("update",(message) => {
    console.log(message)
    console.log(message.list)
    let vars=document.getElementById('leaderboard-list');
    let multi = document.getElementById('multi');
    let scr = document.getElementById('scr');
    multi.innerHTML = 'x '+s.currentMultiplier;
    scr.innerHTML = s.currentScore;
    vars.innerHTML=''
    for(let i=0;i<message.socketList.length;i++) {
        if(message.socketList[i]!== socket.id)
            vars.innerHTML += '<li>' + message.list[message.socketList[i]].name +" "+message.list[message.socketList[i]].score + '</li>';
        else {
            vars.innerHTML += '<li class="my_score">' + message.list[message.socketList[i]].name +" "+message.list[message.socketList[i]].score + '</li>';
        }

    }
})

function keyPressed() {
    if(keyCode === UP_ARROW ){
        s.dir(0,-1);
    }else if(keyCode === DOWN_ARROW){
        s.dir(0,1);
    }else if(keyCode === RIGHT_ARROW){
        s.dir(1,0);
    }else if(keyCode === LEFT_ARROW){
        s.dir(-1,0);
    }
}