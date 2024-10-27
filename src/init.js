import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js';
const init = () => {
	const sizes = {
		width: window.innerWidth - 10,
		height: window.innerHeight,
	};

	const parameters = {
		color: 0xff77ff
	};

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xFCF3E3); //87CEEB 
	const canvas = document.querySelector('.canvas');
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
	scene.add(camera);

	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;

	const stats = new Stats();
	stats.showPanel(0);
	document.body.appendChild(stats.dom);

	const renderer = new THREE.WebGLRenderer({ canvas });
	renderer.setSize(sizes.width, sizes.height);
	renderer.render(scene, camera);

	return { sizes, scene, canvas, camera, renderer, controls, stats, parameters };
};

export default init;