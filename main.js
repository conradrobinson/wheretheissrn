import * as THREE from 'https://unpkg.com/three@0.137.5/build/three.module.js'


//url params
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let resolution = params.res;
let isin = false;
let resolutions = ["ultrahigh", "high", "medium", "low", "ultralow"]
for (let i = 0; i < resolutions.length; i++) {
  if (resolution == resolutions[i]) {
    isin = true;
  }
}
if (!isin) {
  resolution = "ultralow"
}


//
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, document.getElementById("cancont").offsetWidth/document.getElementById("cancont").offsetHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.querySelector('canvas')})
renderer.setSize(document.getElementById("cancont").offsetWidth, document.getElementById("cancont").offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio)

//iss
const issMesh = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 0.1, 0.1),
  new THREE.MeshBasicMaterial({
    color: 0xFF0000
  })
)


const group = new THREE.Group()
//sphere
fetch("./frag.glsl").then(fragmentShader => fragmentShader.text()).then(fragmentShader => {
  fetch("./vert.glsl").then(vertexShader => vertexShader.text()).then(vertexShader => {
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(earthRad, 50, 50),
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        globeTexture: {
          value: new THREE.TextureLoader().load(`./textures/earth-${resolution}.jpg`)
        }
      }
    })
    )
    group.add(sphere)

  })})
//atmosphere
fetch("./atmosfrag.glsl").then(atmosFrag => atmosFrag.text()).then(atmosFrag => {
  fetch("./atmosvert.glsl").then(atmosVert => atmosVert.text()).then(atmosVert => {
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader: atmosVert,
    fragmentShader: atmosFrag,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  })
  )
  atmosphere.scale.set(1.25, 1.25, 1.25)
scene.add(atmosphere)
})})

group.add(issMesh)

scene.add(group)
function animate() {
    requestAnimationFrame(animate)
    group.rotation.y = -rot.x
    group.rotation.x = rot.y
    
    if (!isMouseDown) {
      rot.x += speed.x
      rot.y += speed.y
      speed.x *= 0.97
      speed.y *= 0.97
    } else {
      speed.x = rot.x - last.x;
      speed.y = rot.y - last.y;
      last.x = rot.x
      last.y = rot.y
    }

    if (iss.longitude != undefined) {
      let issPosCart = coordsToPosition((iss.latitude + iss.latitudeOffset), iss.longitude + iss.longitudeOffset, iss.radius)
      issMesh.position.x = issPosCart[0]
      issMesh.position.y = issPosCart[1]
      issMesh.position.z = issPosCart[2]
    }

    camera.position.z = cameraZ


    renderer.render(scene, camera)
}
//janky mouse movements
const rot = {
  x: 0,
  y: 0
}
const speed = {
  x: 0,
  y: 0
}
let isMouseDown = false;
const start = {
  x: 0,
  y: 0
}
const prior = {
  x: 0,
  y: 0
}
const last = {
  x: 0,
  y: 0
}
const cameraRange = [1.4*earthRad, 17]
let cameraZ = 10;
document.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  start.x = e.clientX / innerWidth
  start.y = -(e.clientY / innerHeight)
  prior.x = rot.x
  prior.y = rot.y
})
document.addEventListener('mouseup', (e) => {
  isMouseDown = false;
})
document.addEventListener('mousemove', (e) => {
  if (isMouseDown) {
    rot.x = prior.x + (start.x - (e.clientX / innerWidth))
    rot.y = prior.y + (start.y - -(e.clientY / innerHeight))
  }
  

})

document.addEventListener('wheel', (e) => {
  if(e.deltaY < 0){
    cameraZ -= 0.2;
    if (cameraZ <= cameraRange[0]) {
      cameraZ = cameraRange[0]
    }
}
else {
  cameraZ += 0.2;
  if (cameraZ >= cameraRange[1]) {
    cameraZ = cameraRange[1]
  }
}
})

animate()

function coordsToPosition(lat, long, radius) {
  let a = []
  let phi = 90 - lat;
  let theta = long + 180
  a.push(-radius * Math.sin(phi * (Math.PI / 180)) * Math.cos(theta * (Math.PI / 180)))
  a.push(radius * Math.sin(phi * (Math.PI / 180)) * Math.sin(theta * (Math.PI / 180)))
  a.push(radius * Math.cos(phi * (Math.PI / 180)))
  return a;

}


function getRotation(objPos, pos2) {
  let dy = objPos.y - pos2.y
  let dx = Math.sqrt((objPos.x - pos2.x)**2 + (objPos.z - pos2.z)**2) 
  let rot = Math.tan(dy/dx)
  rot = Math.PI-rot
  return rot
}