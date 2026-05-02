document.addEventListener('DOMContentLoaded', () => {
    
    // ===== 1. Sticky Header =====
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ===== 1.5. Mobile Menu Toggle =====
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ===== 2. Intersection Observer for Scroll Animations =====
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unobserve after animating for better performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements that need to animate
    const animateElements = document.querySelectorAll('.fade-in-up');
    
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // ===== 3. Smooth Scrolling for Navigation Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust for sticky header height
                const headerHeight = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== 4. Three.js Murukku 3D Spiral Animation =====
    if (typeof THREE !== 'undefined') {
        const container = document.getElementById('murukku-canvas-container');
        if (container) {
            // Scene Setup
            const scene = new THREE.Scene();
            
            // Camera
            const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.z = 18;

            // Renderer
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            // Create Murukku Spiral (Authentic Indian Chakli Style)
            class MurukkuCurve extends THREE.Curve {
                constructor(scale = 1) {
                    super();
                    this.scale = scale;
                }
                getPoint(t, optionalTarget = new THREE.Vector3()) {
                    const turns = 4.5; // Number of rings in the spiral
                    const theta = t * Math.PI * 2 * turns;
                    
                    // Exponential outward growth for a tighter center like the photo
                    const radius = 0.2 + 0.6 * theta; 
                    
                    const x = radius * Math.cos(theta);
                    const y = radius * Math.sin(theta);
                    // Add some natural waviness of handmade dough
                    const z = Math.sin(theta * 8) * 0.15 + Math.cos(theta * 15) * 0.05;
                    
                    return optionalTarget.set(x, y, z).multiplyScalar(this.scale);
                }
            }

            const path = new MurukkuCurve(0.28);
            
            // Define Star Nozzle Shape (produces the deep ridges seen in the image)
            const starShape = new THREE.Shape();
            const points = 6; // 6-point star nozzle
            const innerRadius = 0.35;
            const outerRadius = 0.5;
            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const a = (i / (points * 2)) * Math.PI * 2;
                if (i === 0) starShape.moveTo(Math.cos(a) * radius, Math.sin(a) * radius);
                else starShape.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
            }

            // Extrude the star shape along the spiral path
            const extrudeSettings = {
                steps: 600,
                bevelEnabled: false,
                extrudePath: path
            };
            const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);

            // Make it "hyper-realistic crunchy" by carefully displacing vertices
            const positions = geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = positions.getZ(i);
                
                // Fine, sharp crunch noise
                const crunch = (Math.random() - 0.5) * 0.025;
                // Medium lumpiness
                const lump = Math.sin(x*20) * Math.cos(y*20) * 0.02;
                
                positions.setXYZ(i, x + crunch + lump, y + crunch + lump, z + crunch + lump);
            }
            geometry.computeVertexNormals(); // Fix lighting for new crunchy surface
            
            // Ultra-Realistic Golden Fried Material
            const material = new THREE.MeshStandardMaterial({
                color: 0xC86E14, // Exact deep fried brown from the image
                roughness: 0.85,  // Matte fried dough
                metalness: 0.1,   // Slight oil sheen
                flatShading: false // Smooth curves, sharp ridges
            });
            
            const murukku = new THREE.Mesh(geometry, material);
            
            // Wrap in a group for independent mouse interaction
            const group = new THREE.Group();
            group.add(murukku);
            
            // Tilt group so it faces the camera perfectly like the image
            group.rotation.x = -0.4; // Tilt slightly back
            group.rotation.y = 0.2;  // Slight angle
            
            scene.add(group);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
            dirLight.position.set(5, 10, 15);
            scene.add(dirLight);

            const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
            backLight.position.set(-10, -10, -10);
            scene.add(backLight);

            // Mouse Interaction Tracking
            let mouseX = 0;
            let mouseY = 0;
            let targetX = 0;
            let targetY = 0;

            const windowHalfX = window.innerWidth / 2;
            const windowHalfY = window.innerHeight / 2;

            document.addEventListener('mousemove', (event) => {
                mouseX = (event.clientX - windowHalfX) * 0.001;
                mouseY = (event.clientY - windowHalfY) * 0.001;
            });

            // Animation Loop
            let isMurukkuVisible = true;
            const murukkuObserver = new IntersectionObserver((entries) => {
                isMurukkuVisible = entries[0].isIntersecting;
            }, { threshold: 0 });
            murukkuObserver.observe(container);

            function animate() {
                requestAnimationFrame(animate);

                if (!isMurukkuVisible) return; // Pause animation when out of view

                // Spin the murukku like a record (perfect spiral view)
                murukku.rotation.z -= 0.005;

                // Interactive mouse tilt on the group
                targetX = mouseX * 0.8;
                targetY = mouseY * 0.8;
                
                // Add to base tilt
                group.rotation.y += 0.05 * ((0.2 + targetX) - group.rotation.y);
                group.rotation.x += 0.05 * ((-0.4 + targetY) - group.rotation.x);

                renderer.render(scene, camera);
            }

            // Handle Resize
            window.addEventListener('resize', () => {
                if(container.clientWidth > 0 && container.clientHeight > 0) {
                    camera.aspect = container.clientWidth / container.clientHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(container.clientWidth, container.clientHeight);
                }
            });

            animate();
        }
    }

    // ===== 5. Contact Form AJAX Submission =====
    const contactForm = document.getElementById('contact-form');
    const statusMsg = document.getElementById('form-status-msg');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(contactForm);
            
            // Show loading state
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalBtnHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    statusMsg.style.display = 'block';
                    statusMsg.style.backgroundColor = '#DEF7EC';
                    statusMsg.style.color = '#03543F';
                    statusMsg.innerText = 'Thank you! Your message has been sent successfully.';
                    contactForm.reset();
                    contactForm.style.display = 'none';
                } else {
                    throw new Error('Error submitting form');
                }
            } catch (error) {
                statusMsg.style.display = 'block';
                statusMsg.style.backgroundColor = '#FDE8E8';
                statusMsg.style.color = '#9B1C1C';
                statusMsg.innerText = 'Oops! There was a problem submitting your form.';
            } finally {
                btn.innerHTML = originalBtnHtml;
                btn.disabled = false;
            }
        });
    }
});
