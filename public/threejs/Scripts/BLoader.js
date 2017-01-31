function BLoader(readyFunc) {
    var self = this;
    self.readyFunc = readyFunc;
    self.jsonLoader = new THREE.JSONLoader();
    self.textureLoader = new THREE.TextureLoader();
    self.modelsNum = 0;
    self.loadedModels = 0;
    self.loadedStuff = {};

    self.loadSync = function (name, obj) {
        self.loadedStuff[name] = obj;

        if (self.loadedModels == self.modelsNum && self.readyFunc)
            self.readyFunc(self.loadedStuff)
    }

    self.loadAsync = function (name, file, type, scale, func) {
        self.modelsNum++;

        if (type == "model") {
            self.jsonLoader.load(file, function (geometry, materials) {
                var material = new THREE.MultiMaterial(materials);
                self.loadedModels++;
                self.loadSync(name, { geometry: geometry, material: material, type: type, scale: scale, func: func });
            });
        }
        else if (type == "sprite") {
            self.textureLoader.load(file, function (texture) {
                var material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
                self.loadedModels++;
                self.loadSync(name, { material: material, type: type, scale: scale, func: func });
            });
        }
    }
}
