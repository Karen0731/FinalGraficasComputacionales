import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/js/jsm/controls/OrbitControls.js';
import Stats from '/js/jsm/libs/stats.module.js';
import dat from '/js/jsm/libs/dat.gui.module.js';
import {GLTFLoader} from "./GLTFLoader.js"

"using strict";

let renderer, scene, camera, mesh, cameraControl, stats, result, world, boxShape, boxBody;

window.anim = false;
window.reset = false;
window.space = false;
window.earth = false;
window.car = false;
window.apple = false;
window.modelo1 = false;
window.modelo2 = false;
var modelIds = [0,0,0,0];

//Variables for gravity
var targetPositionY = 0.5;
var gravity = 0.01;
var velocity = 0.1; 

let gui = new dat.GUI();
let modelMenu = gui.addFolder("Caracteristicas del objeto");
let skyBoxMenu = gui.addFolder("Seleccionar Lugar");
let simulationMenu = gui.addFolder("Simulacion");

//GRAVITY CALCULATIONS DISPLAY
var calculations = 
{
    gravityR : 0,
    initialVelocityR : 0,
    finalVelocityR: 0,
    mass: 10
}


function init() {

    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    document.body.appendChild(renderer.domElement);

    // SCENE
    scene = new THREE.Scene();

    // CAMERA
    let fov = 60;
    let aspect = window.innerWidth / window.innerHeight;
    let near = 0.1;
    let far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(2, 5, 10);
    cameraControl  = new OrbitControls(camera, renderer.domElement);

    // LIGHTS
    let directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(5, 3, 0);
    directionalLight.castShadow = true;

    selectEarth();
    document.getElementById("gravityText").innerHTML = "9.81";
    document.getElementById("hText").innerHTML = "3";
    document.getElementById("massText").innerHTML = "10";
    earth = true;

    //PHYSICS

    world = new p2.World();
    world.gravity[1] = -9.81;
    console.log(world.gravity[1]);
    world.sleepMode = p2.World.BODY_SLEEPING;

    //GLTFLoader
    // Instantiate a loader
    const loader = new GLTFLoader();
    // Load a glTF resource
    
    

    //FLOOR
    let floor = new Floor();
    floor.receiveShadow = true;

    var planeShape = new p2.Plane();
    var planeBody = new p2.Body({position:[0,0]});
    planeBody.name = "ground";
    planeBody.data = floor;
    planeBody.addShape(planeShape);
    world.addBody(planeBody);
    scene.add(floor);

    //add models
    var worldObjects;
    var position = {x: 0, y: 3}
    addObject('box',world,scene,position)


    // SCENE GRAPH
    //Invisible el cube, que servira de padre a los modelos
    mesh.material.transparent = true;
    mesh.material.opacity = 0;
    
    scene.add(directionalLight);

     
    let model =
    {
        posY : mesh.position.y,
    }
    
    //Start animation for gravity
    simulationMenu.add(window, "anim").name("Start Simulation").listen().onChange(function(value) {
        reset = false;

        //CALCULATE FINAL VELOCITY
        calculations.gravityR = parseFloat(document.getElementById("gravityText").innerHTML);
        calculations.finalVelocityR = Math.sqrt((2*calculations.gravityR)*mesh.position.y);

        //PRINT RESULTS
        document.getElementById("finalVText").innerHTML = (Math.round(calculations.finalVelocityR* 100) / 100).toFixed(2);
    });

    //reset animation
    simulationMenu.add(window, "reset").name("Reset Simulation").listen().onChange(function(value) {
        anim = false;
        mesh.position.set(0,3,0);

        //Reset model values
        document.getElementById("hText").innerHTML = "3";
        modelMenu.__controllers[0].setValue(mesh.position.y);

        resetBodyValues(mesh.position.x,mesh.position.y);

        //reset values de velocidad
        document.getElementById("finalVText").innerHTML = "0";
        document.getElementById("actualVText").innerHTML = "0";

        console.log(boxBody);
    });

    modelMenu.add(model, "posY").min(0).max(50).step(0.5).name("Altura").listen().onChange(function(value){
        mesh.position.y = value;
        document.getElementById("hText").innerHTML = value;
        boxBody.position[1] = value;
    });

    modelMenu.add(calculations, "mass").min(0).max(50).step(0.5).name("Masa").listen().onChange(function(value){
        document.getElementById("massText").innerHTML = value;
    });

    modelMenu.add(window, "car").name("Car").listen().onChange(function(value) {
        if(value == true){
            //quitar modelo activo
            if(apple){
                scene.getObjectByProperty( 'uuid', modelIds[1] ).visible = false;
                apple = false;
            } else if(modelo1){
                scene.getObjectByProperty( 'uuid', modelIds[2] ).visible = false;
                modelo1 = false;
            } else if(modelo2){
                scene.getObjectByProperty( 'uuid', modelIds[3] ).visible = false;
                modelo2 = false;
            }
            loader.load(
                // resource URL
                'Car/scene.gltf',
                // called when the resource is loaded
                function ( gltf ) {
                    gltf.scene.scale.set(0.1,0.1,0.1) // scale***
                    modelIds[0] = gltf.scene.uuid;
                    console.log(modelIds[0]);
                    scene.add( gltf.scene );
                    mesh.add(gltf.scene);
                    gltf.scene.position.x = 0;
                    gltf.scene.position.z = -1;
                    gltf.scene.position.y = -0.4;
                }
            );
        } else{
            scene.getObjectByProperty( 'uuid', modelIds[0] ).visible = false;
            console.log(scene.getObjectByProperty( 'uuid', modelIds[0] ) );
        }
    });
    modelMenu.add(window, "apple").name("Apple").listen().onChange(function(value) {
        if(value == true){
            //quitar modelo activo
            if(car){
                scene.getObjectByProperty( 'uuid', modelIds[0] ).visible = false;
                car = false;
            } else if(modelo1){
                scene.getObjectByProperty( 'uuid', modelIds[2] ).visible = false;
                modelo1 = false;
            } else if(modelo2){
                scene.getObjectByProperty( 'uuid', modelIds[3] ).visible = false;
                modelo2 = false;
            }
            loader.load(
                // resource URL
                'Apple/scene.gltf',
                // called when the resource is loaded
                function ( gltf ) {
                    gltf.scene.scale.set(0.1,0.1,0.1) // scale***
                    modelIds[1] = gltf.scene.uuid;
                    console.log(modelIds[1]);
                    scene.add( gltf.scene );
                    mesh.add(gltf.scene);
                    gltf.scene.position.x = 0;
                    gltf.scene.position.z = -1;
                    gltf.scene.position.y = 0.58;
                }
            );
        }  else{
            console.log(scene.getObjectByProperty( 'uuid', modelIds[1] ) );
            scene.getObjectByProperty( 'uuid', modelIds[1] ).visible = false;
        }
    });
    modelMenu.add(window, "modelo1").name("Pesa").listen().onChange(function(value) {
        if(value == true){
            //quitar modelo activo
            if(apple){
                scene.getObjectByProperty( 'uuid', modelIds[1] ).visible = false;
                apple = false;
            } else if(car){
                scene.getObjectByProperty( 'uuid', modelIds[0] ).visible = false;
                car = false;
            } else if(modelo2){
                scene.getObjectByProperty( 'uuid', modelIds[3] ).visible = false;
                modelo2 = false;
            }
            loader.load(
                // resource URL
                'Modelo1/scene.gltf',
                // called when the resource is loaded
                function ( gltf ) {
                    gltf.scene.scale.set(0.4,0.4,0.4) // scale***
                    modelIds[2] = gltf.scene.uuid;
                    console.log(modelIds[2]);
                    scene.add( gltf.scene );
                    mesh.add(gltf.scene);
                    gltf.scene.position.x = 0;
                    gltf.scene.position.z = 0;
                    gltf.scene.position.y = 0.14;
                }
            );
        }  else{
            console.log(scene.getObjectByProperty( 'uuid', modelIds[2] ) );
            scene.getObjectByProperty( 'uuid', modelIds[2] ).visible = false;
        }
    });
    modelMenu.add(window, "modelo2").name("Caja").listen().onChange(function(value) {
        if(value == true){
            //quitar modelo activo
            if(apple){
                scene.getObjectByProperty( 'uuid', modelIds[1] ).visible = false;
                apple = false;
            } else if(modelo1){
                scene.getObjectByProperty( 'uuid', modelIds[2] ).visible = false;
                modelo1 = false;
            } else if(car){
                scene.getObjectByProperty( 'uuid', modelIds[0] ).visible = false;
                car = false;
            }
            loader.load(
                // resource URL
                'Modelo2/glTF/Modelo2.glb',
                // called when the resource is loaded
                function ( gltf ) {
                    gltf.scene.scale.set(0.8,0.8,0.8) // scale***
                    modelIds[3] = gltf.scene.uuid;
                    console.log(modelIds[3]);
                    scene.add( gltf.scene );
                    mesh.add(gltf.scene);
                    gltf.scene.position.x = 0;
                    gltf.scene.position.z = 0;
                    gltf.scene.position.y = 0.39;
                }
            );
        }  else{
            console.log(scene.getObjectByProperty( 'uuid', modelIds[3] ) );
            scene.getObjectByProperty( 'uuid', modelIds[3] ).visible = false;
        }
    });

    //Changes from space to earth
    skyBoxMenu.add(window, "earth").name("Earth").listen().onChange(function(value) {
        selectEarth();
        earth = true;
        space = false;
        calculations.gravityR = 9.81;
        document.getElementById("gravityText").innerHTML = calculations.gravityR;
        world.gravity[1] = -9.81;
    });

    //changes from earth to space
    skyBoxMenu.add(window, "space").name("Space").listen().onChange(function(value) {
        selectSpace();
        earth = false;
        space = true;
        calculations.gravityR = 5.76;
        document.getElementById("gravityText").innerHTML = calculations.gravityR;
        world.gravity[1] = -5.76;
    });

    skyBoxMenu.open();

    gui.open();
    

    //STATS
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    // RENDER LOOP
    renderLoop();
}

function renderLoop() {
    stats.begin();
    renderer.render(scene, camera); // DRAW SCENE
    updateScene();
    stats.end();
    stats.update();
    requestAnimationFrame(renderLoop);
}


function updateScene() 
{
    let activate = 0.1;
    //FIRST ANIMATION FOR GRAVITY 
    //!NEEDS TO CHANGE FOR ALL GEOMETRIES IN THE FUTURE, SO GOOD IDEA TO CHANGE THIS TO A FUNCTION
    if(anim) {
        //UPDATE PHYSICS
        world.step(1/60);
        
        //FOR EACH OBJECT IN P2 PHYSICS WORLD
        for (var i = 0; i < world.bodies.length; i++) 
        { 
            //IF IT IS A BOX -> UPDATE POSITION AND ROTATION ACCORDINGLY
            if(world.bodies[i].name == "box")
            {
                world.bodies[i].data.position.set(world.bodies[i].position[0],world.bodies[i].position[1],0);
                world.bodies[i].data.rotation.z = world.bodies[i].angle; 
            }
        }; 

        //CALCULATE ACTUAL VELOCITY
        calculations.gravityR = parseFloat(document.getElementById("gravityText").innerHTML);
        calculations.finalVelocityR = Math.sqrt((2*calculations.gravityR)*mesh.position.y);

        //PRINT RESULTS
        document.getElementById("actualVText").innerHTML = (Math.round(calculations.finalVelocityR* 100) / 100).toFixed(2);
        document.getElementById("hText").innerHTML = (Math.round(mesh.position.y* 100) / 100).toFixed(0);
    }
}

// EVENT LISTENERS & HANDLERS
document.addEventListener("DOMContentLoaded", init);

window.addEventListener("resize", function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

class object{
    constructor (mesh,world,scene,position)
    {
        this.mesh = mesh;
        this.world = world;
        this.scene = scene;
        this.position = position;
    }


}
// MODELS
class Floor extends THREE.Mesh {
    constructor() {
        super();
        this.geometry = new THREE.PlaneGeometry(20, 20, 20, 20);
        this.material = new THREE.MeshPhongMaterial();
        this.rotation.x = -0.5 * Math.PI;
        this.wireframeHelper = new THREE.LineSegments(new THREE.WireframeGeometry(this.geometry));
        this.wireframeHelper.material.color = new THREE.Color(0.2, 0.2, 0.2);
        this.add(this.wireframeHelper);
        this.visible = true;
    }
}

function addObject (type,world,scene,position)
{
    switch(type){
        case 'circle':

            break;
        case 'box':
            var w = 1;
            var h = 1;
            var x = position.x;
            var y = position.y;
            let geometry = new THREE.BoxGeometry(w,h,1);
            let material = new THREE.MeshPhongMaterial({ color: getRandomColor() });
            mesh = new THREE.Mesh(geometry, material);

            
            mesh.position.set(x,y,0);
            mesh.castShadow = true;
            mesh.name= "Cube";
            scene.add(mesh);
            //Add Physics to the cube
            //CREATE RANDOM WIDTH AND HEIGHT SIZE
            

            boxShape = new p2.Rectangle(w,h);

            boxBody = new p2.Body({ mass:1, position:[x,y], angularVelocity:1 });
    
            boxBody.allowSleep = true;
            boxBody.sleepSpeedLimit = 1; 
            boxBody.sleepTimeLimit =  1;

            boxBody.data = mesh; // ADD 3d OBJECT AS DATA VALUE
            boxBody.name="box"; //ADD NAME TO THE P2 
    
            boxBody.addShape(boxShape);
            world.addBody(boxBody);
            return [boxBody,boxShape,mesh]
            break;
        default:
            break;

    }
    // MODELS
    

}
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
 }
//Skybox change functions
function selectEarth()
{
    //skybox
    const ft = new THREE.TextureLoader().load("skybox/skyrender0001.bmp");
    const bk = new THREE.TextureLoader().load("skybox/skyrender0004.bmp");
    const up = new THREE.TextureLoader().load("skybox/skyrender0003.bmp");
    const dn = new THREE.TextureLoader().load("skybox/skyrender0006.bmp");
    const rt = new THREE.TextureLoader().load("skybox/skyrender0002.bmp");
    const lf = new THREE.TextureLoader().load("skybox/skyrender0005.bmp");
    
    const materialArr = [];
    materialArr.push( 
        new THREE.MeshBasicMaterial({map:ft,side:THREE.BackSide}),
        new THREE.MeshBasicMaterial({map:bk,side:THREE.BackSide}),
        new THREE.MeshBasicMaterial({map:up,side:THREE.BackSide}),
        new THREE.MeshBasicMaterial({map:dn,side:THREE.BackSide}),
        new THREE.MeshBasicMaterial({map:lf,side:THREE.BackSide}),
        new THREE.MeshBasicMaterial({map:rt,side:THREE.BackSide})
        );
    const textureCube = new THREE.CubeTextureLoader().load( [
        "skybox/skyrender0002.bmp","skybox/skyrender0005.bmp",
        "skybox/skyrender0003.bmp","skybox/skyrender0006.bmp",
        "skybox/skyrender0004.bmp","skybox/skyrender0001.bmp"
    ]);
    
    const materialSkybox = new THREE.MeshBasicMaterial({map:ft,side:THREE.BackSide});

    const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    const skybox = new THREE.Mesh(skyboxGeo,materialArr);

    scene.add(skybox);

    

    
}

function selectSpace()
{
    //skybox
    const ft = new THREE.TextureLoader().load("skybox/sp2_ft.png");
    const bk = new THREE.TextureLoader().load("skybox/sp2_bk.png");
    const up = new THREE.TextureLoader().load("skybox/sp2_up.png");
    const dn = new THREE.TextureLoader().load("skybox/sp2_dn.png");
    const rt = new THREE.TextureLoader().load("skybox/sp2_lf.png");
    const lf = new THREE.TextureLoader().load("skybox/sp2_rt.png");
    
    const materialArr = [];
    materialArr.push( 
        new THREE.MeshBasicMaterial({map:ft,side:THREE.BackSide}),
        new THREE.MeshBasicMaterial({map:bk,side:THREE.BackSide}),
        new THREE.MeshBasicMaterial({map:up,side:THREE.BackSide}),
        new THREE.MeshBasicMaterial({map:dn,side:THREE.BackSide}),
        new THREE.MeshBasicMaterial({map:lf,side:THREE.BackSide}),
        new THREE.MeshBasicMaterial({map:rt,side:THREE.BackSide})
        );
    const textureCube = new THREE.CubeTextureLoader().load( [
        "skybox/sp2_ft.png","skybox/sp2_bk.png",
        "skybox/sp2_up.png","skybox/sp2_dn.png",
        "skybox/sp2_lf.png","skybox/sp2_rt.png"
    ]);
    
    const materialSkybox = new THREE.MeshBasicMaterial({map:ft,side:THREE.BackSide});

    const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    const skybox = new THREE.Mesh(skyboxGeo,materialArr);

    scene.add(skybox);
}

function resetBodyValues(x,y)
{
    boxBody.position[0] = x;
    boxBody.position[1] = y;
    boxBody.angle = 0;
    boxBody.idleTime = 0;
    boxBody.vlambda[0] = 0;
    boxBody.vlambda[1] = 0;
    boxBody.angularVelocity = 1;
    boxBody.wlambda = 0;
}