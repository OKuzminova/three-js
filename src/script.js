import * as THREE from 'three';
import TWEEN from 'three/examples/jsm/libs/tween.module';
import init from './init';
import * as dat from 'lil-gui';
import './style.css';

// 1. Создание сцены и камеры
const {sizes, camera, scene, canvas, controls, renderer, stats, parameters} = init();

const gui = new dat.GUI();

camera.position.z = 7;

const group = new THREE.Group();

// 2. 3D Объекты
const rhombGeometry = new THREE.BoxGeometry(1.5, 1.5, 1, 1);
const coneGeometry = new THREE.ConeGeometry(1, 2, 32, 1);
const octahedronGeometry = new THREE.OctahedronGeometry(1, 0);
const torusGeometry = new THREE.TorusGeometry(1, 0.5, 16, 60);
const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32, 2);
const sphereGeometry = new THREE.SphereGeometry(1.25, 32, 16);

const torusKnotGeometry = new THREE.TorusKnotGeometry(1.3, 0.1, 200, 5, 12, 3);
const geometryPaper = new THREE.SphereGeometry(1.8, 32, 32); //Сфера

const geometries = [
    rhombGeometry,
    coneGeometry,
    octahedronGeometry,
    torusGeometry,
    cylinderGeometry,
    sphereGeometry,
];

// 2.1 Загрузка текстур для сферы
const textureLoader = new THREE.TextureLoader();
const texturesCircle = [
    textureLoader.load('./textures/Paper_Wrinkled_001_basecolor.jpg'), 
    textureLoader.load('./textures/Paper_Wrinkled_001_height.png'),
    textureLoader.load('./textures/Paper_Wrinkled_001_roughness.jpg'),
    textureLoader.load('./textures/Paper_Wrinkled_001_ambientOcclusion.jpg')
];
const texturesCircleNormal = textureLoader.load('./textures/Paper_Wrinkled_001_normal.jpg');
const materialsCircle = texturesCircle.map(texture => {
        return new THREE.MeshStandardMaterial({
            normalMap: texturesCircleNormal,
            map: texture,
            opacity: 0.5,
        });
    });

const sphere = new THREE.Mesh(geometryPaper, materialsCircle[0]);
scene.add(sphere);

// Наложение текстур
materialsCircle.slice(4).forEach(materialCircle => {
    const overlaySphere = new THREE.Mesh(geometryPaper, materialCircle);
    scene.add(overlaySphere);
});


// 2.2 Размещение объектов в разных частях сцены
let index = 0;
let activeIndex = -1;
for (let i = -5; i <= 5; i += 5) {
    for (let j = -5; j <= 5; j += 5) {
        var material = new THREE.MeshBasicMaterial({
            color: parameters.color,
            wireframe: true,
        });
        const mesh = new THREE.Mesh(geometries[index], material);
        mesh.position.set(4 * Math.cos(index), 4 * Math.sin(index), 0);
        mesh.index = index;
        group.add(mesh);
        index += 1;
    };
};

scene.add(group);
gui.add(group, 'visible');

const resetActive = () => {
    group.children[activeIndex].material.color.set('grey');
    activeIndex = -1;
};


// 3. Настройка теней для объектов
const torusKnotMaterial = new THREE.MeshStandardMaterial({ color: 0xB2A6D9 });
const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);

torusKnot.castShadow = true;
torusKnot.receiveShadow = true;
scene.add(torusKnot);
gui.add(torusKnot.scale, 'x').min(0).max(5).step(0.1).name('Resize size x');

// Настройка рендерера2
const renderer2 = new THREE.WebGLRenderer();
renderer2.shadowMap.enabled = true; // включение карты теней

// Добавление направленного света
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 4, 7); // положение света
scene.add(directionalLight);

// Включение теней для света
directionalLight.castShadow = true;

// Добавление источника света
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(1, 5, 10);
scene.add(light);

// 4. Создание анимация при нажатии на объекты
const clock = new THREE.Clock();

const tick = () => {
    stats.begin();
    const delta = clock.getDelta();
    if (activeIndex !== -1) {
        group.children[activeIndex].rotation.x += delta * 0.5;
    }
	controls.update();
	renderer.render(scene, camera);
    stats.end();
	window.requestAnimationFrame(tick);
};
tick();


// 5. Добавление интерактивности 
const raycaster = new THREE.Raycaster();

var previousTooltip;

const handleClick = (event) => {
    console.log(event.geometries);
    const pointer = new THREE.Vector2();
    if (previousTooltip != undefined) {
        previousTooltip.remove();
    }
    const tooltip = document.createElement('div');
    previousTooltip = tooltip;

    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    tooltip.style.padding = '5px';
    tooltip.style.border = '1px solid pink';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(group.children);

    if (activeIndex !== -1) {
        resetActive();
    }
    
    for (let i = 0; i < intersections.length; i += 1) {
        intersections[i].object.material.color.set(0x0077ff);
        activeIndex = intersections[i].object.index;

        new TWEEN.Tween(intersections[i].object.position).to({
            x: 0,
            y: 0,
            z: 25
        }, Math.random() * 1000 + 1000).easing(TWEEN.Easing.Exponential.InOut).start();
    };

    if (intersections.length > 0) {
        tooltip.style.display = 'block';
        tooltip.innerHTML = 'x = ' + pointer.x.toFixed(3) + "<br>" + 'y = ' + pointer.y.toFixed(3);
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
    } else {
        tooltip.style.display = 'none';
    };
};


function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.x += 0.01;
    torusKnot.rotation.z += Math.sin(0.03);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('click', handleClick);

//6. Адаптивность сцены
window.addEventListener('resize', () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 6));
	renderer.render(scene, camera);
});

window.addEventListener('dblclick', () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});
