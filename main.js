gsap.registerPlugin(ScrollTrigger);

let currentCategory = "Office Life";
let currentTheme = "Dark Theme";
let frames = [];
let currentFrame = 0;
let isLoading = false;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const loader = document.getElementById("loader");
const themeToggle = document.getElementById("themeToggle");
const navbar = document.getElementById("navbar");
const navBtns = document.querySelectorAll(".nav-btn");

function padNumber(num) {
    return String(num).padStart(3, "0");
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (frames[currentFrame]) {
        drawFrame(currentFrame);
    }
}

function drawFrame(index) {
    if (!frames[index] || currentFrame === index) return;
    currentFrame = index;
    
    const img = frames[index];
    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = img.width / img.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (canvasAspect > imgAspect) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgAspect;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
    } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function getImagePath(index) {
    return `public/img/${currentCategory}/${currentTheme}/ezgif-frame-${padNumber(index)}.jpg`;
}

async function loadFrames() {
    if (isLoading) return;
    isLoading = true;
    frames = [];
    
    // Get the exact path it is trying to find
    const firstImgPath = getImagePath(1);
    console.log("Attempting to load first frame:", firstImgPath);
    
    const firstImg = new Image();
    firstImg.src = firstImgPath;
    
    try {
        // Wait for the image to load, but catch failures
        await new Promise((resolve, reject) => {
            firstImg.onload = resolve;
            firstImg.onerror = () => reject(new Error(`Missing file: ${firstImgPath}`));
        });
        
        frames[0] = firstImg;
        drawFrame(0);
        
        // Success! Hide the loader
        loader.classList.add("hidden");
        isLoading = false;
        
        // Load the remaining 239 frames silently in the background
        for (let i = 2; i <= 240; i++) {
            const img = new Image();
            img.src = getImagePath(i);
            frames[i - 1] = img;
        }
        
    } catch (error) {
        // IF IT FAILS: Print the exact error to the screen instead of hanging
        console.error("IMAGE LOAD FAILED:", error);
        loader.innerHTML = `
            <div class="text-red-500 text-center px-4">
                <p class="text-2xl font-bold mb-2">Error: Missing Image ⚠️</p>
                <p>The code is looking for this exact file, but cannot find it:</p>
                <p class="mt-2 text-white bg-red-900 p-2 rounded text-sm font-mono">${firstImgPath}</p>
                <p class="mt-4 text-sm text-gray-300">Are you running this via VS Code Live Server?</p>
            </div>
        `;
    }
}

function setupScrollAnimation() {
    ScrollTrigger.getAll().forEach(t => t.kill());
    
    ScrollTrigger.create({
        trigger: "#scrollContainer",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
            const frameIndex = Math.floor(self.progress * 239);
            drawFrame(frameIndex);
        }
    });
    
    if (currentCategory === "College Life") {
        const wrapper = document.querySelector(".horizontal-scroll-content");
        gsap.to(wrapper, {
            x: () => -(wrapper.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: ".horizontal-scroll-wrapper",
                start: "top top",
                end: () => `+=${wrapper.scrollWidth}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1
            }
        });
    }
}

function switchCategory(category) {
    if (category === currentCategory || isLoading) return;
    
    const sections = document.querySelectorAll(".content-section");
    sections.forEach(s => {
        s.style.opacity = "0";
        setTimeout(() => s.classList.add("hidden"), 500);
    });
    
    currentCategory = category;
    
    setTimeout(async () => {
        await loadFrames();
        setupScrollAnimation();
        
        const targetSection = document.getElementById(category.toLowerCase().split(" ")[0]);
        targetSection.classList.remove("hidden");
        setTimeout(() => targetSection.style.opacity = "1", 50);
    }, 500);
}

function toggleTheme() {
    currentTheme = currentTheme === "Dark Theme" ? "Light Theme" : "Dark Theme";
    document.body.className = currentTheme === "Dark Theme" ? "dark-theme" : "light-theme";
    themeToggle.querySelector(".theme-icon").textContent = currentTheme === "Dark Theme" ? "☀️" : "🌙";
    loadFrames();
}

themeToggle.addEventListener("click", toggleTheme);

navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        navBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        switchCategory(btn.dataset.category);
    });
});

ScrollTrigger.create({
    start: "top top",
    end: "max",
    onUpdate: (self) => {
        if (self.scroll() > 100) {
            gsap.to(navbar, {
                top: "1rem",
                bottom: "auto",
                duration: 0.5,
                ease: "power2.out"
            });
        } else if (self.scroll() === 0) {
            gsap.to(navbar, {
                top: "auto",
                bottom: "2rem",
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
loadFrames().then(() => {
    setupScrollAnimation();
});
