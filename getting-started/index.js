import "regenerator-runtime/runtime.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setIntervalAsync } from 'set-interval-async/dynamic';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OGC3DTile, TileLoader, OcclusionCullingService } from '@jdultra/threedtiles';
//import { ShaderNode, uniform, storage, attribute, float, vec2, vec3, color, instanceIndex, PointsNodeMaterial } from 'three/nodes';
//import WebGPU from 'three/addons/capabilities/WebGPU.js';
//import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';


/*if ( WebGPU.isAvailable() === false ) {

    document.body.appendChild( WebGPU.getErrorMessage() );

    throw new Error( 'No WebGPU support' );

}*/


const occlusionCullingService = new OcclusionCullingService();
occlusionCullingService.setSide(THREE.DoubleSide);
const scene = initScene();

const domContainer = initDomContainer("screen");
const camera = initCamera(domContainer.offsetWidth, domContainer.offsetHeight);
const renderer = initRenderer(camera, domContainer);
const composer = initComposer(scene, camera, renderer);

initTileset(scene, 0.5);
initController(camera, domContainer);

animate();


function initTileset(scene, geometricErrorMultiplier) {

    // The tile loader is optional and allows you to control cache size and share a cache between several tilesets
    const tileLoader = new TileLoader({
        renderer: renderer,
        maxCachedItems: 100,
        meshCallback: mesh => {
            //// Insert code to be called on every newly decoded mesh e.g.:
            mesh.material.wireframe = false;
            mesh.material.side = THREE.DoubleSide;
            //mesh.material.metalness = 0.0
        },
        pointsCallback: points => {
            points.material.size = Math.min(1.0, 0.5 * Math.sqrt(points.geometricError));
            points.material.sizeAttenuation = true;
        }
    });

    // Here, you can define the url to your tileset
    const ogc3DTile = new OGC3DTile({
        url: "https://storage.googleapis.com/ogc-3d-tiles/ladybug/tileset.json",
        renderer: renderer, // the Threejs renderer
        geometricErrorMultiplier: geometricErrorMultiplier, // a detail multiplier [0 - infinity] (optional)
        loadOutsideView: false, // load low detail meshes outside the view for better shadows and basic data present when the camera pans (optional)
        tileLoader: tileLoader, // the loader that caches tiles (optional)
        static: false, // set this to true if you'll be moving the model often, for example in a loop (optional)
        centerModel: true, // center the model on the origin (optional)

    });
    setIntervalAsync(function () {
        ogc3DTile.update(camera);
    }, 10);

    // Here, you can define transformation to your tileset eg:
    ogc3DTile.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI * -1.04);

    scene.add(ogc3DTile);

    return ogc3DTile;
}


// The rest of this class is standard threejs code
function initComposer(scene, camera, renderer) {
    const renderScene = new RenderPass(scene, camera);

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    return composer;
}
function initScene() {
    const scene = new THREE.Scene();
    scene.matrixAutoUpdate = false;
    scene.background = new THREE.Color(0x888888);
    scene.add(new THREE.AmbientLight(0xFFFFFF, 1.0));

    return scene;
}

function initDomContainer(divID) {

    const domContainer = document.getElementById(divID);
    domContainer.style = "position: absolute; height:100%; width:100%; left: 0px; top:0px;";
    document.body.appendChild(domContainer);
    return domContainer;
}


/*function initWebGPURenderer(camera, dom){
    const renderer = new WebGPURenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(dom.offsetWidth, dom.offsetHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMappingNode = toneMapping( THREE.LinearToneMapping, 1 );
    return renderer;
}*/
function initRenderer(camera, dom) {

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(dom.offsetWidth, dom.offsetHeight);
    //renderer.toneMappingNode = toneMapping( THREE.LinearToneMapping, 1 );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.autoClear = false;

    dom.appendChild(renderer.domElement);

    onWindowResize();
    window.addEventListener('resize', onWindowResize);
    function onWindowResize() {

        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();

        renderer.setSize(dom.offsetWidth, dom.offsetHeight);
    }

    return renderer;
}


function initCamera(width, height) {
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(4, 2, 4);
    camera.lookAt(0, 6, 0);

    camera.matrixAutoUpdate = true;
    return camera;
}


function initController(camera, dom) {
    const controller = new OrbitControls(camera, dom);

    controller.target.set(0, 0, 0);


    controller.minDistance = 0.1;
    controller.maxDistance = 1000;
    controller.update();
    return controller;
}


function animate() {
    requestAnimationFrame(animate);
    composer.render();
}





