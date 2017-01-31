//bomber 3d
var width = 800;
var heigth = 600;
var blenderScale = 0.4;
var player = {};
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
var explosionSphereGeom = new THREE.SphereGeometry(1, 16, 16);
var explosionSphereGeomEndCap = new THREE.SphereGeometry(0.5, 16, 16);
var explosionSphereCylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);

var explosionMaterial1 = new THREE.MeshLambertMaterial({ color: "#ffffff" });
var explosionMaterial2 = new THREE.MeshLambertMaterial({ color: "#F4DA06" });

var explosionLength = 2000;
var boxMaterial1 = new THREE.MeshLambertMaterial({ color: "#6CD81A" });
var boxMaterialFixed = new THREE.MeshLambertMaterial({ color: "#aaaaaa" });
var borderMaterial = new THREE.MeshLambertMaterial({ color: "#555555", side: THREE.DoubleSide });
var grid = [
	['%', '%', '%', '%', '%', '%', '%', '%', '%', '%', '%'],
	['%', 'A', '@', '$', '$', '$', '$', '$', ' ', '2', '%'],
	['%', ' ', '#', '$', '#', '$', '#', '$', '#', '2', '%'],
	['%', '$', '$', '$', '$', '$', '$', '$', '$', '$', '%'],
	['%', '$', '#', '$', '#', '2', '#', '$', '#', '$', '%'],
	['%', '$', '$', '$', '$', '$', '$', '$', '$', '$', '%'],
	['%', '1', '#', '$', '#', '$', '#', '$', '#', '1', '%'],
	['%', 'C', ' ', '$', '$', '$', '$', '$', '1', '1', '%'],
	['%', '%', '%', '%', '%', '%', '%', '%', '%', '%', '%']
];

renderer.setSize(width, heigth);
renderer.setClearColor(0x222222);
document.body.appendChild(renderer.domElement);

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

function remove(objs) {
    for (var i = 0; i < objs.length; i++) {
        scene.remove(objs[i].object);
    }
}

function explode(size) {

    var sphere = addObject(player.x, player.y, bLoader.loadedStuff["explosionSphere"]);

    var cyl1 = addObject(player.x, player.y, bLoader.loadedStuff["explosionCylinder"]);
    cyl1.object.rotation.x = Math.PI / 2;
    cyl1.object.scale.y = size;

    var cyl2 = addObject(player.x, player.y, bLoader.loadedStuff["explosionCylinder"]);
    cyl2.object.rotation.x = Math.PI / 2;
    cyl2.object.rotation.z = Math.PI / 2;
    cyl2.object.scale.y = size;
    
    var ec1 = addObject(player.x, player.y, bLoader.loadedStuff["explosionSphereEndcap"]);
    ec1.object.position.z+= size/2;
    var ec2 = addObject(player.x, player.y, bLoader.loadedStuff["explosionSphereEndcap"]);
    ec2.object.position.z -= size / 2;
    var ec3 = addObject(player.x, player.y, bLoader.loadedStuff["explosionSphereEndcap"]);
    ec3.object.position.x += size / 2;
    var ec4 = addObject(player.x, player.y, bLoader.loadedStuff["explosionSphereEndcap"]);
    ec4.object.position.x -= size / 2;
    
    var objs = [sphere, cyl1, cyl2, ec1,ec2,ec3,ec4];

    setTimeout(function () {
        remove(objs);
    }, explosionLength);
}

function move(event) {
    console.log(event.which);
    var tempY = player.y;
    var tempX = player.x;

    switch (event.which) {
        case 119:
            console.log("upp");
            tempY--;
            player.obj.rotation.y = Math.PI;
            break;
        case 115:
            console.log("ned");
            player.obj.rotation.y = 0;
            tempY++;
            break;
        case 97:
            console.log("vänster");
            player.obj.rotation.y = -Math.PI / 2;
            tempX--;
            break;
        case 100:
            console.log("höger");
            player.obj.rotation.y = Math.PI / 2;
            tempX++;
            break;
        case 122:
            explode(5);
            return;
        case 120:
            explode(3);
            return;
        case 99:
            explode(1);
            return;
        default:
            return;
    }

    var objOnPos = gridObjects[tempY + "_" + tempX];
    var gridObj = grid[tempY][tempX];

    if ((gridObj != '#' && gridObj != '%')) {
        player.x = tempX;
        player.y = tempY;

        if (objOnPos && objOnPos.object != player.obj) {
            scene.remove(objOnPos.object);
            gridObjects[player.y + "_" + player.x] = null;
        }

        grid[player.y][player.x] = " ";
        player.obj.position.z = player.y;
        player.obj.position.x = player.x;
    }
}

function addObject(x, y, loadedObj) {
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
    if (loadedObj.func)
        loadedObj.func(obj, x, y);

    gridObjects[y + "_" + x] = obj
    obj.object.position.x = x;
    obj.object.position.z = y;
    scene.add(obj.object);
    return obj;
}

function init(loadedStuff) {

    var floorGeom = new THREE.PlaneGeometry(xScale, yScale);
    var floor = new THREE.Mesh(floorGeom, borderMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.x = xScale / 2 - 0.5;
    floor.position.z = yScale / 2 - 0.5;
    floor.position.y = -boxSize / 2;
    scene.add(floor);

    for (var y = 0; y < grid.length; y++) {
        var row = grid[y];
        for (var x = 0; x < row.length; x++) {
            var col = row[x];
            var loadedObj = loadedStuff[col];
            if (loadedObj != null) {
                addObject(x, y, loadedObj);
            }
        }
    }

    // (color, intensity)
    var light = new THREE.PointLight(0xffffff, 0.9);
    // (x, y, z)
    light.position.set(xScale / 2, 10, yScale / 2);
    scene.add(light);

    camera.position.set(5.026834384743997, 11.565823248616343, 8.10856187385891);
    controls.target.set(5.026834384743997, -1.8699039169448395, 3.8555165223830943);

    $("body").keypress(move);
    render();
}

bLoader.readyFunc = init;
bLoader.loadAsync("@", "Models/bomb.json", "model", blenderScale);
bLoader.loadAsync("1", "Images/powerup_power.png", "sprite");
bLoader.loadAsync("2", "Images/powerup_bomb.png", "sprite");
bLoader.loadAsync("A", "Models/monkeyshaded.json", "model", blenderScale, function (obj, x, y) {
    player.y = y;
    player.x = x;
    player.obj = obj.object;
});


bLoader.loadSync("explosionSphere", { geometry: explosionSphereGeom, material: explosionMaterial1, type: "model" });
bLoader.loadSync("explosionCylinder", { geometry: explosionSphereCylinder, material: explosionMaterial2, type: "model" });
bLoader.loadSync("explosionSphereEndcap", { geometry: explosionSphereGeomEndCap, material: explosionMaterial2, type: "model" });

bLoader.loadSync("$", { geometry: boxGeom, material: boxMaterial1, type: "model" });
bLoader.loadSync("#", { geometry: boxGeom, material: boxMaterialFixed, type: "model" });
bLoader.loadSync("%", {
    geometry: boxGeomBorder, material: boxMaterialFixed, type: "model", func: function (obj) {
        obj.object.position.y -= (boxSize - borderHeight) / 2;
    }
});