import LineArt from './LineArt';
import Easing from './Easing';


function SceneManager(canvas) {

    
    const screenDimensions = {
        width: canvas.width,
        height: canvas.height
    }
    
    const scene = buildScene();
    const renderer = buildRender(screenDimensions);
    const camera = buildCamera(screenDimensions);

    const sceneSubjects = createSceneSubjects(scene);



    function buildScene() {
        const scene = new THREE.Scene();

        return scene;
    }

    function buildRender({ width, height }) {
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); 
        const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
        renderer.setPixelRatio(DPR);
        renderer.setSize(width, height);
        renderer.setClearColor(0xffffff, 0)

        return renderer;
    }

    function buildCamera({ width, height }) {
        const aspectRatio = window.innerWidth / window.innerHeight;
        const fieldOfView = 40;
        const nearPlane = 1;
        const farPlane = 1000; 
        const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

        return camera;
    }

    function createSceneSubjects(scene) {
        const sceneSubjects = [
            new LineArt(scene),
        ];
        return sceneSubjects;
    }

    function updateCameraPosition(index, scrollPos) {

        // array of tuple like arrays with the camera's position & camera's target
        const camPositions = [
            [new THREE.Vector3(10, 0, 150), new THREE.Vector3(0, 0, 0)],
            [new THREE.Vector3(10, -95, 150), new THREE.Vector3(0, -100, 0)],
            [new THREE.Vector3(0, -190, 150), new THREE.Vector3(0, -190, 0)],
            [new THREE.Vector3(0, -190, 150), new THREE.Vector3(0, -190, 0)],
        ]
        const scrollPosEase = scrollPos
        // const scrollPosEase = Easing.easeOutCubic(scrollPos)

        // Calculate camera position
        const prevPosition = camPositions[index][0];
        const camPosition = prevPosition.lerp(camPositions[index + 1][0], scrollPosEase)
        const [xPos, yPos, zPos] = camPosition.toArray() 

        camera.position.set(xPos, yPos, zPos);

        // Calculate camera target
        const prevTarget = camPositions[index][1];
        const camTarget = prevTarget.lerp(camPositions[index + 1][1], scrollPosEase)
        const [xTarg, yTarg, zTarg] = camTarget.toArray()

        camera.lookAt(new THREE.Vector3(xTarg, yTarg, zTarg))

    }


    this.update = function() {
        // TODO: This should probably be removed from the SceneManager
        var panels = document.getElementsByClassName('js-panel');
          
        var currentpanelIndex = [...panels].reduce((prev, panel, index) => {
            if (panel.offsetTop < window.scrollY) return index
            return prev
        }, 0)

        var currentpanel = panels[currentpanelIndex]
        var nextpanel = panels[currentpanelIndex + 1]

        var scrollPos = (window.scrollY - currentpanel.offsetTop) / currentpanel.offsetHeight

        for(let i=0; i<sceneSubjects.length; i++) {
        	sceneSubjects[i].update(currentpanelIndex, scrollPos);
        }

        updateCameraPosition(currentpanelIndex, scrollPos);
        renderer.render(scene, camera);
    }

    this.onWindowResize = function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }
}


export default SceneManager;
