import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/js/jsm/controls/OrbitControls.js';
import Stats from '/js/jsm/libs/stats.module.js';
import dat from '/js/jsm/libs/dat.gui.module.js';

"using strict";

let renderer, scene, camera, mesh, cameraControl, stats, gui, result;

window.anim = false;
window.reset = false;
window.space = false;
window.earth = false;

//Variables for gravity
var targetPositionY = 0.5;
var gravity = 0.01;
var velocity = 0.1; 

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
    earth = true;

    // MODELS
    let geometry = new THREE.BoxGeometry();
    let material = new THREE.MeshPhongMaterial({color: "red"});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0,3,0);
    mesh.castShadow = true;
    mesh.name= "Cube";

    //FLOOR
    let floor = new Floor();
    floor.receiveShadow = true;

    // SCENE GRAPH
    scene.add(mesh);
    scene.add(floor);
    scene.add(directionalLight);

    //GUI
    gui = new dat.GUI();
    
    //Start animation for gravity
    gui.add(window, "anim").name("Start Simulation").listen().onChange(function(value) {
        reset = false;
        setTimeout(function(){
            anim = false;
          }, 2000);
    });

    //reset animation
    gui.add(window, "reset").name("Reset Simulation").listen().onChange(function(value) {
        anim = false;
        mesh.position.set(0,3,0);
    });

    let skyBoxMenu = gui.addFolder("Select Place");
    //Changes from space to earth
    skyBoxMenu.add(window, "earth").name("Earth").listen().onChange(function(value) {
        selectEarth();
        earth = true;
        space = false;
    });

    //changes from earth to space
    skyBoxMenu.add(window, "space").name("Space").listen().onChange(function(value) {
        selectSpace();
        earth = false;
        space = true;
    });

    skyBoxMenu.open();

    gui.open();

    //GRAVITY CALCULATIONS DISPLAY
    var calculations = {
        gravityR : 9.81,
        velocityR : 9.86
    }

    result = new dat.GUI({autoPlace : false});
    var customContainer = document.getElementById('result');
    customContainer.appendChild(result.domElement);

    result.add(calculations, 'gravityR').name("Gravity").listen().onChange(function(value) {
        
    });

    result.add(calculations, 'velocityR').name("Velocity").listen().onChange(function(value) {
        
    });

    result.open();

    

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
        if (mesh.position.y <= targetPositionY) {
             velocity = -velocity * 0.8;
        }
        else{
            velocity += gravity;
            //console.log(velocity);
        }
        mesh.position.y -= velocity;
        console.log(activate);
    }
}

// EVENT LISTENERS & HANDLERS
document.addEventListener("DOMContentLoaded", init);

window.addEventListener("resize", function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

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