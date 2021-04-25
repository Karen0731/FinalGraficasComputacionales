import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/js/jsm/controls/OrbitControls.js';
import Stats from '/js/jsm/libs/stats.module.js';
import dat from '/js/jsm/libs/dat.gui.module.js';
import * as Ammo from '/js/jsm/physics/ammo.js';

"using strict";

let renderer, scene, camera, mesh, cameraControl, stats;

        function init() {

            // RENDERER
            renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            // SCENE
            scene = new THREE.Scene();

            // CAMERA
            let fov = 60;
            let aspect = window.innerWidth / window.innerHeight;
            let near = 0.1;
            let far = 10000;
            camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            camera.position.set(0, 0, 3);
            cameraControl  = new OrbitControls(camera, renderer.domElement);

            // MODELS
            let geometry = new THREE.BoxGeometry();
            let material = new THREE.MeshBasicMaterial({color: "white", wireframe: true});
            mesh = new THREE.Mesh(geometry, material);
            mesh.name= "Cube";

            // SCENE GRAPH
            scene.add(mesh);

            //GUI   
            let gui = new dat.GUI();


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

        }

        // EVENT LISTENERS & HANDLERS
        document.addEventListener("DOMContentLoaded", init);

        window.addEventListener("resize", function(){
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });