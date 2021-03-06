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

var explosionCylinderSize = 0.57;

var explosionSphereGeom = new THREE.SphereGeometry(1.2, 16, 16);
var explosionSphereGeomEndCap = new THREE.SphereGeometry(explosionCylinderSize, 16, 16);
var explosionSphereCylinder = new THREE.CylinderGeometry(explosionCylinderSize, explosionCylinderSize, 1, 32);

var explosionMaterial1 = new THREE.MeshBasicMaterial({ color: "#ffffff" });
var explosionMaterial2 = new THREE.MeshBasicMaterial({ color: "#F4DA06" });

var explosionLength = 2000;
var boxMaterial1 = new THREE.MeshLambertMaterial({ color: "#6CD81A" });
var boxMaterialFixed = new THREE.MeshLambertMaterial({ color: "#aaaaaa" });
var borderMaterial = new THREE.MeshLambertMaterial({ color: "#888888", side: THREE.DoubleSide });
var grid = [
    ['%', '%', '%', '%', '%', '%', '%', '%', '%', '%', '%'],
    ['%', 'A', '@', '$', '$', '$', '$', '$', ' ', '2', '%'],
    ['%', ' ', '#', '$', '#', '$', '#', '$', '#', '2', '%'],
    ['%', '$', '$', '$', '$', '$', '$', '$', '$', '$', '%'],
    ['%', '$', '#', '$', '#', '2', '#', '$', '#', '$', '%'],
    ['%', '$', '$', '$', '$', '$', '$', '$', '$', '$', '%'],
    ['%', '1', '#', '$', '#', '$', '#', '$', '#', '1', '%'],
    ['%', 'C', '2', '3', '4', '$', '$', '$', '1', '1', '%'],
    ['%', '%', '%', '%', '%', '%', '%', '%', '%', '%', '%']
];

renderer.setSize(width, heigth);
renderer.setClearColor(0x222222);
renderer.shadowMap.enabled = true;
renderer.shadowMap.soft = true;
renderer.gammaInput = true;
renderer.gammaOutput = true;
//renderer.toneMapping = THREE.ReinhardToneMapping;

document.body.appendChild(renderer.domElement);

var materials = [ explosionMaterial1,explosionMaterial2,boxMaterial1,boxMaterialFixed,borderMaterial];

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
    ec1.object.position.z += size / 2;
    var ec2 = addObject(player.x, player.y, bLoader.loadedStuff["explosionSphereEndcap"]);
    ec2.object.position.z -= size / 2;
    var ec3 = addObject(player.x, player.y, bLoader.loadedStuff["explosionSphereEndcap"]);
    ec3.object.position.x += size / 2;
    var ec4 = addObject(player.x, player.y, bLoader.loadedStuff["explosionSphereEndcap"]);
    ec4.object.position.x -= size / 2;

    //var bulbGeometry = new THREE.SphereGeometry(1, 16, 8);
    var bulbLight = new THREE.PointLight(0xffee88, 5, 2, 1);

    //var bulbMat = new THREE.MeshStandardMaterial({
    //    emissive: 0xffffee,
    //    emissiveIntensity: 1,
    //    color: 0x000000
    //});
    //bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
    bulbLight.position.set(player.x, 0.8, player.y);
 //   bulbLight.castShadow = true;
    scene.add(bulbLight);
    var objs = [sphere, cyl1, cyl2, ec1, ec2, ec3, ec4];

    for (var i=0;i<materials.length;i++) {
        materials[i].needsUpdate = true;
    }

    setTimeout(function () {
        remove(objs);
        bulbLight.visible = false;
        scene.remove(bulbLight);
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
            console.log("v�nster");
            player.obj.rotation.y = -Math.PI / 2;
            tempX--;
            break;
        case 100:
            console.log("h�ger");
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

    obj.object.castShadow = true;
    obj.object.receiveShadow = true;

    gridObjects[y + "_" + x] = obj;
    obj.object.position.x = x;
    obj.object.position.z = y;
    if (loadedObj.func)
        loadedObj.func(obj, x, y, loadedObj);

    scene.add(obj.object);
    return obj;
}

function init(loadedStuff) {

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
                addObject(x, y, loadedObj);
            }
        }
    }

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

    helper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(helper);

    camera.position.set(5.026834384743997, 11.565823248616343, 8.10856187385891);
    controls.target.set(5.026834384743997, -1.8699039169448395, 3.8555165223830943);

    $("body").keypress(move);
    render();
}

bLoader.readyFunc = init;

bLoader.loadAsync("boxTexture1", "Images/brocks.png", "texture");

bLoader.loadAsync("@", "Models/bomb.json", "model", blenderScale);
bLoader.loadAsync("1", "Images/powerup_power.png", "sprite");
bLoader.loadAsync("2", "Images/powerup_bomb.png", "sprite");
bLoader.loadAsync("3", "Images/powerup_speed.png", "sprite");
bLoader.loadAsync("4", "Images/powerup_burntime.png", "sprite");
bLoader.loadAsync("A", "/games/bomberman/Models/p1.json", "model", 0.3, function (obj, x, y, loadedObj) {
    player.y = y;
    player.x = x;
    player.obj = obj.object;
    obj.object.position.y -= .4;
    player.obj.receiveShadow = true;
    player.obj.castShadow = true;

    //obj.object.rotation.y = -Math.PI/2;
});
function removeShadow(obj) {
    obj.object.receiveShadow = false;
    obj.object.castShadow = false;
}

bLoader.loadSync("explosionSphere", { geometry: explosionSphereGeom, material: explosionMaterial1, type: "model", func: removeShadow });
bLoader.loadSync("explosionCylinder", { geometry: explosionSphereCylinder, material: explosionMaterial2, type: "model", func: removeShadow });
bLoader.loadSync("explosionSphereEndcap", { geometry: explosionSphereGeomEndCap, material: explosionMaterial2, type: "model", func: removeShadow });

//bLoader.loadSync("$", { geometry: boxGeom, material: boxMaterial1, type: "model" });
bLoader.loadSync("#", { geometry: boxGeom, material: boxMaterialFixed, type: "model" });
bLoader.loadSync("%", {
    geometry: boxGeomBorder, material: boxMaterialFixed, type: "model", func: function (obj) {
        obj.object.position.y -= (boxSize - borderHeight) / 2;
    }
});