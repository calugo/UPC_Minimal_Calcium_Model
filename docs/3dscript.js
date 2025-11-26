
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {FontLoader} from "three/addons/loaders/FontLoader.js";
import Module from './cark.js';

let camera, scene, renderer;
let gui;
let x,y,I;
let xp,yp,zp,prt,tf,Nb;
let Ts, Tr, Tmax;
let dotGeometry,DotGeo,pt;
let statusmsg; 
let Rt;
let play_button, clear_button;
let playflag = false;
const playtime = 'Play t: ';
let T = [];
let Cs = [];
let Cr = [];
let Is = [];
const frustumSize = 1;
let sols;

///////////////////////////////////////////
const mymod = await Module();
const rk = mymod.cwrap('rk', 'number', ['number','number','number','number','number','number']);
var xo = new Float64Array([0.0, 0.0, 0.0, 0.0]);
var nDataBytes = xo.length * xo.BYTES_PER_ELEMENT;
var dataPtr = mymod._malloc(nDataBytes);
var dataHeap = new Float64Array(mymod.HEAPF64.buffer, dataPtr, nDataBytes);
dataHeap.set(new Float64Array(xo.buffer));
let dotSolMat = new THREE.PointsMaterial(
          {opacity:0.75, size: 2.5, color: 0xc1f211, transparent: true});

/////////////////////////////////////////////////
const material = new THREE.LineBasicMaterial({
	color: 0xffffff,opacity:0.75
});
const points1 = [];
const points2 = [];
const points3 = [];

points1.push( new THREE.Vector3( -0.85, -0.45, 0 ) );
points1.push( new THREE.Vector3( 0.85, -0.45, 0 ) );

const geometry1 = new THREE.BufferGeometry().setFromPoints( points1 );
const ax1 = new THREE.Line( geometry1, material );

points2.push( new THREE.Vector3( -0.85, -0.45, 0 ) );
points2.push( new THREE.Vector3( -0.85, 0.5, 0 ) );;
const geometry2 = new THREE.BufferGeometry().setFromPoints( points2 );
const ax2 = new THREE.Line( geometry2, material );


points3.push( new THREE.Vector3( -0.85, 0, 0 ) );
points3.push( new THREE.Vector3( 0.85, 0, 0 ) );;
const geometry3 = new THREE.BufferGeometry().setFromPoints( points3 );
const ax3 = new THREE.Line( geometry3, material );
///////////////////////////////////////////////////
const fcolor = 0xe5fc0f;
const matLite = new THREE.MeshBasicMaterial( {
    color: fcolor,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  } );
///////////////////////////////////////////////////
init()

statusmsg = document.getElementById('info');
statusmsg.innerText='Ready \n';

function init(){

        Ts = 200;
        Tr = 400;
        xp = 0.0;
        yp = 0.0;
        zp = 0.0;
        Nb = 5;
        tf = Nb*Ts;

				scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x222222 );

        const aspect = window.innerWidth / window.innerHeight;
				camera = new THREE.OrthographicCamera( frustumSize * aspect / - 1.5, frustumSize * aspect / 1.5, frustumSize / 1.5, frustumSize / - 1.5, 0.1, 200 );
        camera.position.set(0.0, 0.0, 150.5);

				scene.add( new THREE.AmbientLight( 0xf0f0f0, 3 ) );
				const light = new THREE.SpotLight( 0xffffff, 4.5 );
				light.position.set( 0, 1500, 200 );
				light.angle = Math.PI * 0.2;
				light.decay = 0;
				light.castShadow = true;
				light.shadow.camera.near = 200;
				light.shadow.camera.far = 2000;
				light.shadow.bias = - 0.000222;
				light.shadow.mapSize.width = 1024;
				light.shadow.mapSize.height = 1024;
				scene.add( light );

        dotGeometry = new THREE.BufferGeometry();
        dotGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0]), 3));
        ///////////////////////////////////////////////////
        scene.add( ax1 );
        scene.add( ax2 );
        scene.add( ax3 );
        //camera.position.set(0.0, 0.0, 3.5);
	  		scene.add( camera );
        
	      renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.shadowMap.enabled = true;
        document.body.appendChild( renderer.domElement );

        // Controls
	const controls = new OrbitControls( camera, renderer.domElement );
	controls.damping = 0.2;
        controls.enableRotate = false;
	controls.addEventListener( 'change', render );

        window.addEventListener( 'resize', onWindowResize );
        onWindowResize();

        //////////////////////////////////////////////
        let font;
        const loader = new FontLoader();
        loader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",function(font){
        const msg1 = 'Time/(N+1)Ts'
        const sh1  = font.generateShapes(msg1,0.05);
        const geometry = new THREE.ShapeGeometry( sh1 );
        const text = new THREE.Mesh( geometry, matLite );
        text.position.set(0.4,-0.52,0.0);
        scene.add( text );

        const textx = new THREE.Mesh( geometry, matLite );
        textx.position.set(0.4,-0.09,0.0);
        scene.add( textx );



        const msg2 = 'Ci/Ci*';
        const sh2  = font.generateShapes(msg2,0.05);
        const geometry2 = new THREE.ShapeGeometry( sh2 );
        const text2 = new THREE.Mesh( geometry2, matLite );
        text2.position.set(-0.82,-0.09,0.0);
        scene.add( text2 );

        const msg3 = 'Cr/Cr*';
        const sh3  = font.generateShapes(msg3,0.05);
        const geometry3 = new THREE.ShapeGeometry( sh3 );
        const text3 = new THREE.Mesh( geometry3, matLite );
        text3.position.set(-0.82,0.4,0.0);
        scene.add( text3 );



        render();
        });
        //////////////////////////////////////////////

        initGui();
        render();
}
///////////////////////
function rem_solution(){
  setIntTitle('Clearing');
  let kn = 0;
  //let remo = [];
  while(kn<2*T.length){
    scene.remove(scene.getObjectByName(kn));
    kn++;
  }
  render();
  playflag = false;
  play_button.enable();
  clear_button.disable();
  setIntTitle('Ready');
}

////////////////////////
function add_solution(jn, rn){
        pt = new THREE.Points(dotGeometry, dotSolMat);
        pt.position.x = rn[0];
        pt.position.z = 0.0;
        pt.position.y = rn[1];
        pt.name = jn;
        //console.log(pt)
        scene.add(pt);
}
/////////////////////////
function render() {


    console.log()
    renderer.render(scene, camera);
}
////////////////////////
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}
/////////////////////////
function initGui(){

  gui =  new GUI();

  const param = {
    'Ts': Ts,
    'Beats N': Nb,
    'Tr': Tr,
    'Run': Ronpy,
    'Clear': rem_solution
  };




  gui.add( param, 'Ts', 200, 600, 10 ).onChange( function ( val ) {
      Ts = val;
    } );

  gui.add( param, 'Tr',200,450, 10 ).onChange( function ( val ) {
      Tr =val;
    });

  gui.add( param, 'Beats N', 1.0, 40.0, 1.0 ).onChange( function ( val ) {
    
     Nb = val
     tf = Nb*Ts;
    } );

  play_button = gui.add(param,'Run');
  clear_button = gui.add(param,'Clear').disable();

}
////////////////////////////
function setIntTitle(title){
  statusmsg.innerText = title;
}
///////////////////////////
function Ronpy(){
 setIntTitle('Integrating');
 setTimeout(function(){
  Runpy();
 },10);
}
/////////////////////////
function Runpy(){

  if(playflag){rem_solution();}

   console.log("Playing",Ts);
   let t = 0.0; let dt=0.1;
   let tp = 0.0; let dtp = 0.5;
  var result = new Float64Array(dataHeap.buffer, dataHeap.byteOffset, xo.length);
  x=xo[0];y=xo[1];

  T=[];Cs=[];Cr=[];Is=[];
  let jn=0;
  while (t<Nb*Ts){
    rk(x,y,t,Ts,Tr,dataHeap.byteOffset,xo.length);
    var result = new Float64Array(dataHeap.buffer, dataHeap.byteOffset, xo.length);
    x = result[2]; y = result[3]; I = result[1];

    if (t>tp){
      T[jn]=t;
      Cs[jn]=x;
      Cr[jn]=y;
      Is[jn]=I;
      jn+=1;
      tp+=dtp
    }
    t+=dt;
  } 
  play_button.disable(false);
  mymod._free(dataHeap.byteOffset);
  Play();
  //setIntTitle('Ready');
}
///////////////////////////////
function Play(){

  if (playflag == false){
    let jn =0;
    let Tmax = (Nb+1)*Ts//Math.max(...T);
    let Ymax = Math.max(...Cs);
    let Yrmax = Math.max(...Cr);
    console.log(Tmax,Ymax,Yrmax)

    while(jn<T.length){
      add_solution(jn,[ (T[jn]/(0.5*Tmax))-0.85,(Cs[jn]/(2.5*Ymax))-0.45])
      jn++;
    }
    
    let jm=0;
    while(jm<T.length){
      
      add_solution(jm+T.length,[ (T[jm]/(0.5*Tmax))-0.85,(Cr[jm]/(2.5*Yrmax))])
      jm++;
    }

    let sn = 'Cr*: '+parseFloat(Yrmax).toFixed(2) +' mM, '+'Cs*: '+parseFloat(Ymax).toFixed(2) +'mM, '+'Tr/Ts: '+parseFloat(Tr/Ts).toFixed(2);
    //setIntTitle('Ready');
    setIntTitle(sn);
    render();
    playflag = true;
    play_button.disable();
    clear_button.enable();

  }
}
//////////////////////////////////
