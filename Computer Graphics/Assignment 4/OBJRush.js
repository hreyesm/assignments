let request;
let container;
let camera, scene, raycaster, renderer;
let objectList = [];

let mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
let radius = 100, theta = 0;

let duration = 30;
let currentTime = Date.now();

let points = 0;
let nEnemies = 1;

let seconds = 15;

let timer = setInterval(function() {
    seconds--;
    $("#timer").html("Time Left: " + seconds);
    if (seconds <= 0) {
        $("#timer").html("Game Over");
        clearInterval(timer);
        gameOver();
    }
}, 1000);


let objModelUrl = {obj:'../models/obj/cat/cat.obj', map:'../models/obj/cat/cat.jpg'};

function promisifyLoader ( loader, onProgress )
{
    function promiseLoader ( url ) {
        
        return new Promise( ( resolve, reject ) => {
            
            loader.load( url, resolve, onProgress, reject );
            
        } );
    }
    
    return {
        originalLoader: loader,
        load: promiseLoader,
    };
}

const onError = ( ( err ) => { console.error( err ); } );

async function loadObj(objModelUrl)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());
    
    try {
        let object = await objPromiseLoader.load(objModelUrl.obj);
        let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material.map = texture;
            }
        });
        
        object.name = 'Cat';
        object.scale.set(2, 2, 2);
        object.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, -750);
        object.rotation.x = 5.25;
        
        objectList.push(object);
        
        scene.add(object);
    }
    catch (err) {
        return onError(err);
    }
}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    objectList.forEach(object => {
        object.position.z += fract * 10;
        if (object.position.z >= -200) {
            damageFromEnemy(object);
        }
    });
}

function damageFromEnemy(object) {
    scene.remove(object);
    if (points > 0) {
        points--;
    }
    $("#points").html("Points: " + points);
    console.log("points:", points);
    respawn();
}

function damageToEnemy(object) {
    scene.remove(object);
    points++;
    $("#points").html("Points: " + points);
    console.log("points:", points);
    respawn();
}

function respawn() {
    objectList.pop();
    if (objectList < nEnemies) {
        loadObj(objModelUrl);
    }
}

function gameOver() {
    if (confirm("Game Over\nPoints: " + points + "\n\nPress OK to restart")){
        window.location.reload(true);
    }
    else {
        window.cancelAnimationFrame(request);
        request = undefined;
    }
}

function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    
    let light = new THREE.DirectionalLight( 0xffffff, 1 );
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    light.position.set( 1, 1, 1 );
    scene.add( light );
    scene.add(ambientLight);

    $("#points").html("Points: " + points);

    for ( let i = 0; i < nEnemies; i ++ ) 
    {
        loadObj(objModelUrl);
    }
    
    raycaster = new THREE.Raycaster();
        
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mousedown', onDocumentMouseDown);
    
    window.addEventListener( 'resize', onWindowResize);
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) 
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( scene.children, true );
    
    if ( intersects.length > 0 ) 
    {
        let closer = intersects.length - 1;

        if ( INTERSECTED != intersects[ closer ].object ) 
        {
            if ( INTERSECTED)
            {
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            }

            INTERSECTED = intersects[ closer ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } 
    else 
    {
        if ( INTERSECTED ) 
            INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;
    }
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( scene.children, true );

    console.log("intersects", intersects);
    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ intersects.length - 1 ].object;
        CLICKED.material.emissive.setHex( 0x00ff00 );
        damageToEnemy(CLICKED.parent);
    } 
    else 
    {
        if ( CLICKED ) {
            CLICKED.material.emissive.setHex( CLICKED.currentHex );
        }

        CLICKED = null;
    }
}

function run() 
{
    request = requestAnimationFrame( run );
    render();
    animate();
}

function render() 
{
    renderer.render( scene, camera );
}