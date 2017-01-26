//bomber 3d
var width = 800;
var heigth = 600;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, width / heigth, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();

var loadedStuff = {
    modelsNum: 0,
    loadedModels: 0
};

var blenderScale = 0.4;

var player = {};
var boxSize = .8;
var boxSizeBorder = 1;
var borderHeight = boxSizeBorder / 2;
var xScale = 11;
var yScale = 9;
var gridObjects = {};
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
renderer.setClearColor(0x555555);
document.body.appendChild(renderer.domElement);

var boxGeom = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
var boxGeomBorder = new THREE.BoxGeometry(boxSizeBorder, borderHeight, boxSizeBorder);
var boxMaterial1 = new THREE.MeshLambertMaterial({ color: "#6f5ca8" });
var boxMaterialFixed = new THREE.MeshLambertMaterial({ color: "#ffff00" });
var borderMaterial = new THREE.MeshLambertMaterial({ color: "#ffff00", side: THREE.DoubleSide });

function init() {
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
            //   console.log(col);

            var loadedObj = loadedStuff[col];

            if (loadedObj != null) {
                var obj;

                if (loadedObj.type == "model") {
                    obj = new THREE.Mesh(loadedObj.geometry, loadedObj.material);
                }
                else if (loadedObj.type == "sprite") {
                    obj = new THREE.Sprite(loadedObj.material);
                }
                if (loadedObj.scale) {
                    obj.scale.set(loadedObj.scale, loadedObj.scale, loadedObj.scale);
                }
                if (loadedObj.func)
                    loadedObj.func(obj, x, y);

                gridObjects[y + "_" + x] = obj;
                obj.position.x = x;
                obj.position.z = y;
                scene.add(obj);
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

    $("body").keypress(function (event) {
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
        }

        var objOnPos = gridObjects[tempY + "_" + tempX];
        var gridObj = grid[tempY][tempX];

        if ((gridObj != '#' && gridObj != '%')) {

            player.x = tempX;
            player.y = tempY;

            if (objOnPos) {
                scene.remove(objOnPos);
                gridObjects[player.y + "_" + player.x] = null;
            }

            grid[player.y][player.x] = " ";
            player.obj.position.z = player.y;
            player.obj.position.x = player.x;
        }

    });

    render();
}

// Loading stuff
var jsonLoader = new THREE.JSONLoader();
var textureLoader = new THREE.TextureLoader();

function loadSync(name, obj) {
    loadedStuff[name] = obj;
    
    if (loadedStuff.loadedModels == loadedStuff.modelsNum)
        init()
}

function loadAsync(file, name, type, scale, func) {

    loadedStuff.modelsNum++;

    if (type == "model") {
        jsonLoader.load(file, function (geometry, materials) {
            var material = new THREE.MultiMaterial(materials);
            loadedStuff.loadedModels++;
            loadSync(name, { geometry: geometry, material: material, type: type, scale: scale, func: func });
        });
    }
    else if (type == "sprite") {

        textureLoader.load(file, function (texture) {
            var material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
            loadedStuff.loadedModels++;
            loadSync(name, { material: material, type: type, scale: scale, func: func });
        });
    }
}

loadAsync("Models/monkeyshaded.json", "A", "model", blenderScale, function (obj, x, y) {
    player.y = y;
    player.x = x;
    player.obj = obj;
});
loadAsync("Models/bomb.json", "@", "model", blenderScale);
loadAsync("images/powerup_power.png", "1", "sprite");
loadAsync("images/powerup_bomb.png", "2", "sprite");

loadSync("$", { geometry: boxGeom, material: boxMaterial1, type: "model" });
loadSync("#", { geometry: boxGeom, material: boxMaterialFixed, type: "model" });
loadSync("%", {
    geometry: boxGeomBorder, material: boxMaterialFixed, type: "model", func: function (obj) {
        obj.position.y -= (boxSize - borderHeight) / 2;
    }
});

controls = new THREE.OrbitControls(camera, renderer.domElement);

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
}
