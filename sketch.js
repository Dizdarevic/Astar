var startX = null;
var startY = null;
var endX = null;
var endY = null;
var cols = null;
var rows = null;
var grid = new Array(cols);
var openSet = null;
var closedSet = null;
var start;
var end;
var w, h; //width and height of each node
var path = null;
var canvas = null;
var pathLength = 0;
var heuDiv = null;
var valuesDiv = null;


function Spot(i, j) {
    // location of spot
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = undefined;

    this.wall = false;
    if (random(1) < 0.4) this.wall = true;

    this.show = function(col) {
        if (this.wall) {
            fill(0);
            noStroke();
            rect(this.i * w, this.j * h, w, h);
        } else if (col){
            fill(col);
            rect(this.i * w, this.j * h, w, h);
        }
    }

    this.addNeighbors = function(grid) {
        var i = this.i;
        var j = this.j;
        if (i < cols - 1) this.neighbors.push(grid[i + 1][j]);
        if (i > 0) this.neighbors.push(grid[i - 1][j]);
        if (j < rows - 1) this.neighbors.push(grid[i][j + 1]);
        if (j > 0) this.neighbors.push(grid[i][j - 1]);
        if (i > 0 && j > 0) this.neighbors.push(grid[i - 1][j - 1]);
        if (i < cols - 1 && j > 0) this.neighbors.push(grid[i + 1][j - 1]);
        if (i > 0 && j < rows - 1) this.neighbors.push(grid[i - 1][j + 1]);
        if (i < cols - 1 && j < rows - 1) this.neighbors.push(grid[i + 1][j + 1]);
    }
}


function removeFromArray(arr, element) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == element) arr.splice(i, 1);
    }
}


//CHANGE ALL HEURISTIC FORMULAS TO OTHERSSSSSSSSS
function heuristic(a, b) {
    var which = document.getElementById("whichHeuristic").value;
    if(which === "first"){
        var d = abs(a.i - b.i) + abs(a.j - b.j);
        console.log("Heuristic formula (Manhattan): abs(a.i - b.i) + abs(a.j - b.j)");
        heuDiv.innerHTML = ("Heuristic formula (Manhattan): abs(a.i - b.i) + abs(a.j - b.j)");
    } else if (which === "second") {
        var d = Math.sqrt((a.i - b.i) * (a.i - b.i) + (a.j - b.j) * (a.j - b.j));
        console.log("Heuristic formula (Euclidean): Math.sqrt((a.i - b.i) * (a.i - b.i) + (a.j - b.j) * (a.j - b.j))");
        heuDiv.innerHTML = ("Heuristic formula (Euclidean): Math.sqrt((a.i - b.i) * (a.i - b.i) + (a.j - b.j) * (a.j - b.j))");
    } else {
        var d = Math.max(abs(a.i - b.i), abs(a.j - b.j));   
        console.log("Heuristic formula (Chebyshev): Math.max(abs(a.i - b.i), abs(a.j - b.j))");
        heuDiv.innerHTML = ("Heuristic formula (Chebyshev): Math.max(abs(a.i - b.i), abs(a.j - b.j))");
    }
    return d;
}

var frameSpeed = document.getElementById("frameSpeed");



function setup() {
    cols = document.getElementById('columns').value;
    rows = document.getElementById('rows').value;
    console.log(document.getElementById("frameSpeed").value);

    heuDiv = document.getElementById('heuDiv');
    valuesDiv = document.getElementById('valuesDiv');
    canvas = createCanvas(cols*20, rows*20);

    startX = document.getElementById('startX').value;
    startY = document.getElementById('startY').value;
    endX = document.getElementById('endX').value;
    endY = document.getElementById('endY').value;
    
    
    
    
    openSet = [];
    closedSet = [];
    path = [];
    
    console.log('A*');
    
    // gride node size
    w = width / cols;
    h = height / rows;
    
    // construct 2D array
    for (var i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
    } 

    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j] = new Spot(i, j);
        }
    }
    
    // adding neighbors
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].addNeighbors(grid);
        }
    }

    
    console.log("Starting Node at: [" + startX + "," + startY + "]");
    console.log("Ending Node at: [" + endX + "," + endY + "]");
    

    start = grid[startX][startY];
    end = grid[endX][endY];


    start.wall = false;
    end.wall = false;


    // push so only starting node is in openSet
    openSet.push(start);
}

function draw() { 
    
    
    
    if (document.getElementById("frameSpeed").value === "slow"){
            frameRate(1);
        }else if (document.getElementById("frameSpeed").value === "medium"){
            frameRate(5);
        }else {
            frameRate(10);
        }
    // still searching or not
    if (openSet.length > 0) {

        // Best next option
        var winner = 0;
        for (var i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[winner].f) winner = i;
        }
        var current = openSet[winner];

        // finished searching or not
        if (current === end) {
            noLoop();
            console.log("DONE!");
            valuesDiv.innerHTML = ("F: " + current.f + "<br>G: " + current.g + "<br>H: " + current.h + "<br>Path: " + path.length);
        }

        // Best option moves from openSet to closedSet
        removeFromArray(openSet, current);
        closedSet.push(current);

        // Check all the neighbors
        var neighbors = current.neighbors;
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];

                // Valid next spot?
            if (!closedSet.includes(neighbor) && !neighbor.wall) {
                var tempG = current.g + heuristic(neighbor, current);

                // Is this a better path than before?
                var newPath = false;
                if (openSet.includes(neighbor)) {
                    if (tempG < neighbor.g) {
                        neighbor.g = tempG;
                        newPath = true;
                    }
                } else {
                    neighbor.g = tempG;
                    newPath = true;
                    openSet.push(neighbor);
                }

            // better path?
                if (newPath) {
                    neighbor.h = heuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.previous = current;
                }
            }
        }
    // no solution
    } else {
        console.log('no solution');
        var newDiv = createDiv('').size(100,100);
        newDiv.html("No Solution for this map");
        noLoop();
        return;
    }

    // draw current standing
    background(255);

    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].show();
        }
    }
  
    start.show(color(0, 255, 0));
    end.show(color(255, 0, 0));
    
    for (var i = 0; i < closedSet.length; i++) {
        closedSet[i].show(color(255, 0, 0, 75));
    }

    for (var i = 0; i < openSet.length; i++) {
        openSet[i].show(color(0, 0, 255, 70));
    }

    // find path by checking backwards
    path = [];
    var temp = current;
    path.push(temp);
    while (temp.previous) {
        path.push(temp.previous);
        temp = temp.previous;
    }
    
    // draw path as line
    noFill();
    stroke(0, 0, 200);
    strokeWeight(w / 3);
    beginShape();
    for (var i = 0; i < path.length; i++) {
        vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
    }
    endShape();
}

function setValues(){
    startX = 5;
    startY = 5;
    endX = 10;
    endY = 10;
    start.show(color(0, 255, 0));
    end.show(color(255, 0, 0));

    loop();
    setup();
}










