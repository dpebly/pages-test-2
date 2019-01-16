import SceneManager from './threejs/SceneManager';

const canvas = document.getElementById("canvas");
const sceneManager = new SceneManager(canvas);

bindEventListeners();
render();


function bindEventListeners() {
    window.addEventListener('resize', function() {
        sceneManager.onWindowResize()
    });
    window.addEventListener('touchmove', function() {
        sceneManager.onWindowResize()
    });

    let ticking = false;
    window.addEventListener('scroll', function(e) {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                ticking = false;
            });
        }
        ticking = true;
    });

    sceneManager.onWindowResize(); 
}


function render() {
    requestAnimationFrame(render);
    sceneManager.update();
}



// anchor links
let anchorlinks = document.querySelectorAll('a[href^="#"]')
for (let item of anchorlinks) { // relitere 
    item.addEventListener('click', (e)=> {
        let hashval = item.getAttribute('href')
        let target = document.querySelector(hashval)
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
        history.pushState(null, null, hashval)
        e.preventDefault()
    })
}