import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/js/jsm/controls/OrbitControls.js';
import Stats from '/js/jsm/libs/stats.module.js';
import dat from '/js/jsm/libs/dat.gui.module.js';
import * as Ammo from '/js/jsm/physics/ammo.js';

"using strict";

let renderer, scene, camera, mesh, cameraControl, stats, gui;
window.anim = false;
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
    gui.add(window, "anim").name("Start Simulation").listen().onChange(function(value) {

    });
    gui.open();


    gui.close();

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
    //FIRST ANIMATION FOR GRAVITY 
    if(anim) {
        if (mesh.position.y <= targetPositionY) {
             velocity = -velocity * 0.84; 
             //console.log("reversed");
        }
        else{
            velocity += gravity;
            //console.log(velocity);
        }
        mesh.position.y -= velocity;
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