//game stuff

var ACTION_MOVE_UP = 0;
var ACTION_MOVE_RIGHT = 1;
var ACTION_MOVE_DOWN = 2;
var ACTION_MOVE_LEFT = 3;
var ACTION_PLACE_BOMB = 4;

var EVENT_TYPE_EXPLOSION = 0;
var EVENT_TYPE_EXPLOSION_END = 1;
var EVENT_TYPE_POSITIONS = 2;

var OBJECT_EMPTY = ' ';
var OBJECT_BOMB = '@';
var OBJECT_DESTRUCTIBLE_BLOCK = '$';
var OBJECT_INDESTRUCTIBLE_BLOCK = '#';

var POWERUP_BOMBS = '1';
var POWERUP_BURN = '2';
var POWERUP_STRENGTH = '3';
var POWERUP_SPEED = '4';

var PLAYER_1 = "A";
var PLAYER_2 = "B";
var PLAYER_3 = "C";
var PLAYER_4 = "D";

var EXP_TYPE_CENTER = 0;
var EXP_TYPE_UP = 1;
var EXP_TYPE_DOWN = 2;
var EXP_TYPE_LEFT = 3;
var EXP_TYPE_RIGHT = 4;
var EXP_TYPE_VERT = 5;
var EXP_TYPE_HORI = 6;

var scale = 2;
var w = 32 * scale;
var h = 32 * scale;

var rows = 9;
var cols = 11;
var sprites;

var game;

var oldGrid = null;
var gameDiv = null;
var bombs = {};
var savedLoadedStuff = null;

// 3d stuff
var players = {};
var explosions = {};

var width = 800;
var heigth = 400;
var blenderScale = 0.4;
var boxSize = .8;
var boxSizeBorder = 1;
var borderHeight = boxSizeBorder / 2;
var xScale = 11;
var yScale = 9;
var gridObjects = {};
var bLoader = new BLoader();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, width / heigth, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
var controls = new THREE.OrbitControls(camera, renderer.domElement);
var boxGeom = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
var boxGeomBorder = new THREE.BoxGeometry(boxSizeBorder, borderHeight, boxSizeBorder);

var explosionCylinderSize = 0.57;

var explosionSphereGeom = new THREE.SphereGeometry(1.2, 16, 16);
var explosionSphereGeomEndCap = new THREE.SphereGeometry(explosionCylinderSize, 16, 16);
var explosionSphereCylinder = new THREE.CylinderGeometry(explosionCylinderSize, explosionCylinderSize, 1, 32);

var explosionMaterial1 = new THREE.MeshBasicMaterial({ color: "#ffffff" });
var explosionMaterial2 = new THREE.MeshBasicMaterial({ color: "#F4DA06" });

var explosionLength = 2000;
var boxMaterial1 = new THREE.MeshLambertMaterial({ color: "#6CD81A" });
var boxMaterialFixed = new THREE.MeshLambertMaterial({ color: "#aaaaaa" });
var borderMaterial = new THREE.MeshLambertMaterial({ color: "#555555", side: THREE.DoubleSide });
var grid = undefined;

renderer.setSize(width, heigth);
renderer.setClearColor(0x222222);
renderer.shadowMap.enabled = true;
renderer.shadowMap.soft = true;
renderer.gammaInput = true;
renderer.gammaOutput = true;

var container = document.getElementById('bombermanContainer');
container.appendChild(renderer.domElement);

var spriteAni = [125, 133, 141, 148, 156, 164, 171, 178, 185, 192, 198, 205, 211, 216, 221, 226, 231, 235, 238, 241, 244, 246, 248, 249, 250, 250, 250, 249, 248, 246, 244, 241, 238, 235, 231, 226, 221, 216, 211, 205, 198, 192, 185, 178, 171, 164, 156, 148, 141, 133, 125, 117, 109, 102, 94, 86, 79, 72, 65, 58, 52, 45, 39, 34, 29, 24, 19, 15, 12, 9, 6, 4, 2, 1, 0, 0, 0, 1, 2, 4, 6, 9, 12, 15, 19, 24, 29, 34, 39, 45, 52, 58, 65, 72, 79, 86, 94, 102, 109, 117, 125];
for (var i = 0; i < spriteAni.length; i++) {
    spriteAni[i] = spriteAni[i] / 2000;
}

function render() {
    for (var key in gridObjects) {
        if (gridObjects.hasOwnProperty(key)) {
            var obj = gridObjects[key];
            if (obj && obj.type == "sprite") {
                obj.aniPos++;
                if (obj.aniPos == spriteAni.length - 1)
                    obj.aniPos = 0;
                obj.object.position.y = spriteAni[obj.aniPos];
            }
        }
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
}

function removeExplosionById(id) {
    if (explosions[id]) {
        remove(explosions[id]);
        delete explosions[id];
    }
}

function remove(objs) {
    for (var i = 0; i < objs.length; i++) {
        scene.remove(objs[i].object);
    }
}

function explode(event) {
    var sphere = addObject(event.col, event.row, bLoader.loadedStuff["explosionSphere"]);

    var cyl1 = addObject(event.col, event.row, bLoader.loadedStuff["explosionCylinder"]);
    cyl1.object.rotation.x = Math.PI / 2;
    cyl1.object.scale.y = event.size;

    var cyl2 = addObject(event.col, event.row, bLoader.loadedStuff["explosionCylinder"]);
    cyl2.object.rotation.x = Math.PI / 2;
    cyl2.object.rotation.z = Math.PI / 2;
    cyl2.object.scale.y = event.size;

    var ec1 = addObject(event.col, event.row, bLoader.loadedStuff["explosionSphereEndcap"]);
    ec1.object.position.z += event.size / 2;
    var ec2 = addObject(event.col, event.row, bLoader.loadedStuff["explosionSphereEndcap"]);
    ec2.object.position.z -= event.size / 2;
    var ec3 = addObject(event.col, event.row, bLoader.loadedStuff["explosionSphereEndcap"]);
    ec3.object.position.x += event.size / 2;
    var ec4 = addObject(event.col, event.row, bLoader.loadedStuff["explosionSphereEndcap"]);
    ec4.object.position.x -= event.size / 2;

    var objs = [sphere, cyl1, cyl2, ec1, ec2, ec3, ec4];

    explosions[event.bombId] = objs;
}

function try_move(action) {
    //alert("try move");
    var data = { action: action };
    gameLobby.gameEvent(data);
}

function setup_game(conf) {
    console.log("Setup_game: Bomberman");
}

function debugStuff() {
    //   alert("debugg stuff");
    for (var key in gridObjects) {
        if (gridObjects.hasOwnProperty(key)) {
            var obj = gridObjects[key];

            if (obj && obj.object)
                scene.remove(obj.object);
        }
    }
}

function move(event) {
    switch (event.which) {
        case 120:
            debugStuff();
            break;
        case 122:
        case 32:
            try_move(ACTION_PLACE_BOMB);
            break;
        case 97:
        case 65:
        case 37:
            try_move(ACTION_MOVE_LEFT);
            break;
        case 119:
        case 87:
        case 38:
            try_move(ACTION_MOVE_UP);
            break;
        case 100:
        case 68:
        case 39:
            try_move(ACTION_MOVE_RIGHT);
            break;
        case 115:
        case 83:
        case 40:
            try_move(ACTION_MOVE_DOWN);
            break;
    }
}

function addObject(x, y, loadedObj, char) {
    var obj;

    if (loadedObj.type == "model") {
        obj = { object: new THREE.Mesh(loadedObj.geometry, loadedObj.material) };
    }
    else if (loadedObj.type == "sprite") {
        obj = { object: new THREE.Sprite(loadedObj.material) };
        obj.type = "sprite";
        obj.aniPos = 0;
    }
    if (loadedObj.scale) {
        obj.object.scale.set(loadedObj.scale, loadedObj.scale, loadedObj.scale);
    }

    obj.object.castShadow = true;
    obj.object.receiveShadow = true;

    obj.char = char;
    console.log(obj.object.uuid + " ADD");

    if (char) {
        if (gridObjects[y + "_" + x] && gridObjects[y + "_" + x].object && !isPlayer(gridObjects[y + "_" + x].char))
            scene.remove(gridObjects[y + "_" + x].object);

        gridObjects[y + "_" + x] = obj;
    }

    obj.object.position.x = x;
    obj.object.position.z = y;
    if (loadedObj.func)
        loadedObj.func(obj, x, y, loadedObj, char);

    scene.add(obj.object);
    return obj;
}

function init(loadedStuff) {
    savedLoadedStuff = loadedStuff;
    gameLobby.registerGame(setup_game, game_event);

    bLoader.loadSync("$", { geometry: boxGeom, material: loadedStuff["boxTexture1"].material, type: "model" });

    var floorGeom = new THREE.PlaneGeometry(xScale, yScale);
    var floor = new THREE.Mesh(floorGeom, borderMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.x = xScale / 2 - 0.5;
    floor.position.z = yScale / 2 - 0.5;
    floor.position.y = -boxSize / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    for (var y = 0; y < grid.length; y++) {
        var row = grid[y];
        for (var x = 0; x < row.length; x++) {
            var col = row[x];
            var loadedObj = loadedStuff[col];
            if (loadedObj != null) {
                addObject(x, y, loadedObj, col);
            }
        }
    }

    oldGrid = grid;

    // (color, intensity)
    var light = new THREE.DirectionalLight(0xffffff, 0.25);
    light.castShadow = true;

    light.shadow.mapSize.height = 1024;
    light.shadow.mapSize.width = 1024;
    // (x, y, z)
    light.position.set(-5 + xScale / 2, 10, yScale / 2);
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    light.target.position.set(2 + xScale / 2, -5, yScale / 2);
    scene.add(light.target);

    camera.position.set(5.026834384743997, 8.851088505051793, 9.42820291737039);
    controls.target.set(5.026834384743997, -1.8699039169448395, 3.8555165223830943);

    $("body").keyup(move);
    render();
}

function isRemovableObject(char) {
    return char == '@' || char == '1' || char == '2' || char == '3' || char == '4' || char == '$';
}

function isPlayer(char) {
    return char == 'A' || char == 'B' || char == 'C' || char == 'D';
}

function update_cell(y, x, chars) {
    // alert("update cell");
    oldGrid[y][x] = chars;
    chars = chars.trim();
    var go = gridObjects[y + "_" + x];
    if ((chars == '' || isPlayer(chars)) && go && isRemovableObject(go.char)) {
        scene.remove(go.object);
        console.log(go.object.uuid + " REMOVE");
        console.log("object deleted: " + go.char);
        gridObjects[y + "_" + x] = undefined;
        // return;
    }

    for (var i = 0; i < chars.length; i++) {
        var char = chars[i];
        if (isRemovableObject(char)) {
            var loadedObj = savedLoadedStuff[char];
            if (loadedObj != null && (!go || go.char != char)) {
                console.log("adding char:" + char + " " + chars);
                addObject(x, y, loadedObj, char);
            }
        }

        if (players[char]) {
            players[char].position.z = y;
            players[char].position.x = x;
            //move player
        }
    }
}

function game_event(event) {
    console.log(event);
    if (event.type === EVENT_TYPE_EXPLOSION) {
        explode(event);

        var gridString = JSON.stringify(event.grid);
        console.log(gridString);

    }
    if (event.type === EVENT_TYPE_EXPLOSION_END) {
        removeExplosionById(event.bombId);
    }

    if (event.pos) {
        for (var p = 0; p < event.pos.length; p++) {
            var pos = event.pos[p];
            update_cell(pos[0], pos[1], pos[2]);
        }
        return;
    }

    if (event.grid) {
        if (grid == null) {
            grid = event.grid;
            oldGrid = event.grid;
        }

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                if (oldGrid === null || oldGrid[r][c] !== event.grid[r][c] || event.type === EVENT_TYPE_EXPLOSION_END || event.type === EVENT_TYPE_EXPLOSION) {
                    var char = event.grid[r][c];
                    update_cell(r, c, char);
                }
            }
        }
        return;
    }
}

bLoader.readyFunc = init;
bLoader.loadAsync("boxTexture1", "/games/bomberman/Images/brocks.png", "texture");
bLoader.loadAsync("@", "/games/bomberman/Models/bomb.json", "model", blenderScale);
bLoader.loadAsync("1", "/games/bomberman/Images/powerup_power.png", "sprite");
bLoader.loadAsync("2", "/games/bomberman/Images/powerup_bomb.png", "sprite");
bLoader.loadAsync("3", "/games/bomberman/Images/powerup_speed.png", "sprite");
bLoader.loadAsync("4", "/games/bomberman/Images/powerup_burntime.png", "sprite");

function playerFunc(obj, x, y, loadedObj, char) {
    players[char] = obj.object;
    obj.object.position.y -= .4;
}

bLoader.loadAsync("A", "/games/bomberman/Models/p1.json", "model", 0.3, playerFunc);
bLoader.loadAsync("B", "/games/bomberman/Models/p2.json", "model", 0.3, playerFunc);
bLoader.loadAsync("C", "/games/bomberman/Models/p3.json", "model", 0.3, playerFunc);
bLoader.loadAsync("D", "/games/bomberman/Models/p4.json", "model", 0.3, playerFunc);

bLoader.loadSync("explosionSphere", { geometry: explosionSphereGeom, material: explosionMaterial1, type: "model" });
bLoader.loadSync("explosionCylinder", { geometry: explosionSphereCylinder, material: explosionMaterial2, type: "model" });
bLoader.loadSync("explosionSphereEndcap", { geometry: explosionSphereGeomEndCap, material: explosionMaterial2, type: "model" });

//bLoader.loadSync("$", { geometry: boxGeom, material: boxMaterial1, type: "model" });
bLoader.loadSync("#", { geometry: boxGeom, material: boxMaterialFixed, type: "model" });
bLoader.loadSync("%", {
    geometry: boxGeomBorder, material: boxMaterialFixed, type: "model", func: function (obj) {
        obj.object.position.y -= (boxSize - borderHeight) / 2;
    }
});


