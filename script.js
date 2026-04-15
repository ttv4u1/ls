/**
 * BPK - Lusion Style Engine v2.0.0
 * Features: Smooth Scroll, WebGL Image Distortion, Liquid Shaders
 */

// 1. LOCOMOTIVE SCROLL INIT
const lscroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    lerp: 0.07
});

// 2. THREE.JS SCENE SETUP
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('.webgl'),
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 3. SHADER MATERIAL (The Liquid Effect)
const vertexShader = `
    varying vec2 vUv;
    uniform float uOffset;
    void main() {
        vUv = uv;
        vec3 newPosition = position;
        // Distorsi melengkung saat scroll (Lusion effect)
        newPosition.y += sin(uv.x * 3.1415) * uOffset * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;

const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uAlpha;
    void main() {
        vec4 color = texture2D(uTexture, vUv);
        gl_FragColor = vec4(color.rgb, uAlpha);
    }
`;

// 4. MAPPING IMAGES TO WEBGL
const images = [...document.querySelectorAll('.webgl-target')];
const meshes = [];

images.forEach(img => {
    const bounds = img.getBoundingClientRect();
    const texture = new THREE.TextureLoader().load(img.src);
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32);
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTexture: { value: texture },
            uOffset: { value: 0 },
            uAlpha: { value: 1 }
        }
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(bounds.width, bounds.height, 1);
    scene.add(mesh);
    meshes.push({ mesh, element: img, top: bounds.top });
});

// 5. ANIMATION LOOP
let scrollOffset = 0;
let lastScroll = 0;

function animate() {
    // Calculate Scroll Speed for Distortion
    const currentScroll = lscroll.scroll.instance.scroll.y;
    scrollOffset = currentScroll - lastScroll;
    lastScroll = currentScroll;

    // Update Mesh Positions
    meshes.forEach(obj => {
        const bounds = obj.element.getBoundingClientRect();
        obj.mesh.position.y = -bounds.top + window.innerHeight/2 - bounds.height/2;
        obj.mesh.position.x = bounds.left - window.innerWidth/2 + bounds.width/2;
        
        // Apply Distortion
        obj.mesh.material.uniforms.uOffset.value = scrollOffset * 0.05;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Coordinate Camera with Pixels
camera.position.z = 600; 
const fov = 2 * Math.atan((window.innerHeight / 2) / 600) * (180 / Math.PI);
camera.fov = fov;
camera.updateProjectionMatrix();

animate();

// 6. LOADER LOGIC
let progress = 0;
const interval = setInterval(() => {
    progress += Math.random() * 10;
    if(progress >= 100) {
        progress = 100;
        clearInterval(interval);
        gsap.to("#loader", { y: "-100%", duration: 1, ease: "power4.inOut", delay: 0.5 });
    }
    document.querySelector('.count').innerText = Math.floor(progress);
    document.querySelector('.loader-bar').style.width = progress + "%";
}, 100);