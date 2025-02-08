const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const downloadBtn = document.getElementById("download");
const resetBtn = document.getElementById("reset");
const zoomInput = document.getElementById("zoom");
const moveXInput = document.getElementById("moveX");
const moveYInput = document.getElementById("moveY");
const roundnessInput = document.getElementById("roundness");

const BG_FRAME_SRC = "bg-frame.png";
const FG_FRAME_SRC = "fg-frame.png";
const CANVAS_SIZE = 400; // Kích thước canvas (1:1)

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

let userImg = null;
let croppedImage = null;
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let roundness = 0;

const bgFrame = new Image();
const fgFrame = new Image();
bgFrame.src = BG_FRAME_SRC;
fgFrame.src = FG_FRAME_SRC;

bgFrame.onload = drawCanvas;
fgFrame.onload = drawCanvas;

// Xử lý tải ảnh lên
upload.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        userImg = new Image();
        userImg.onload = function () {
            croppedImage = cropToSquare(userImg); // Cắt ảnh về tỷ lệ 1:1
            drawCanvas(); // Hiển thị ngay ảnh đã cắt
        };
        userImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Hàm cắt ảnh về tỷ lệ 1:1
function cropToSquare(img) {
    const size = Math.min(img.width, img.height); // Chọn cạnh ngắn nhất
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = size;
    tempCanvas.height = size;

    const xOffset = (img.width - size) / 2;
    const yOffset = (img.height - size) / 2;

    tempCtx.drawImage(img, xOffset, yOffset, size, size, 0, 0, size, size);

    // Tạo ảnh mới từ canvas
    const newImg = new Image();
    newImg.onload = drawCanvas; // Hiển thị ảnh sau khi load
    newImg.src = tempCanvas.toDataURL();
    return newImg;
}

// Vẽ ảnh lên canvas
function drawCanvas() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(bgFrame, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (croppedImage) {
        const imgWidth = CANVAS_SIZE * zoom;
        const imgHeight = CANVAS_SIZE * zoom;
        const imgX = CANVAS_SIZE / 2 - imgWidth / 2 + offsetX;
        const imgY = CANVAS_SIZE / 2 - imgHeight / 2 + offsetY;

        // Bo tròn ảnh nếu cần
        ctx.save();
        ctx.beginPath();
        drawRoundedRect(ctx, imgX, imgY, imgWidth, imgHeight, roundness);
        ctx.clip();
        ctx.drawImage(croppedImage, imgX, imgY, imgWidth, imgHeight);
        ctx.restore();
    }

    ctx.drawImage(fgFrame, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

// Vẽ hình chữ nhật bo tròn từng góc
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Cập nhật khi người dùng điều chỉnh zoom & vị trí
zoomInput.addEventListener("input", function () {
    zoom = parseFloat(this.value);
    drawCanvas();
});

moveXInput.addEventListener("input", function () {
    offsetX = parseFloat(this.value);
    drawCanvas();
});

moveYInput.addEventListener("input", function () {
    offsetY = parseFloat(this.value);
    drawCanvas();
});

// Cập nhật bo góc
roundnessInput.addEventListener("input", function () {
    roundness = parseFloat(this.value);
    drawCanvas();
});

// Reset về trạng thái ban đầu
resetBtn.addEventListener("click", function () {
    zoom = 1;
    offsetX = 0;
    offsetY = 0;
    roundness = 0;
    croppedImage = null;
    zoomInput.value = "1";
    moveXInput.value = "0";
    moveYInput.value = "0";
    roundnessInput.value = "0";
    drawCanvas();
});

// Xử lý tải ảnh xuống
downloadBtn.addEventListener("click", function () {
    const link = document.createElement("a");
    link.download = "avatar_fb.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});

// Cài đặt các tham số hiệu ứng nền
particlesJS("particles-js", {
    particles: {
        number: {
            value: 100, // Số lượng hạt
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: "#ffffff" // Màu hạt
        },
        shape: {
            type: "star", // Hình dạng hạt (circle, edge, triangle, polygon, star)
            stroke: {
                width: 0,
                color: "#000000"
            }
        },
        opacity: {
            value: 0.5,
            random: false
        },
        size: {
            value: 3, // Kích thước hạt
            random: true
        },
        line_linked: {
            enable: true, // Nối các hạt bằng đường thẳng
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2, // Tốc độ di chuyển của hạt
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out"
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "repulse" // Khi di chuột, các hạt sẽ đẩy nhau các giá trị khác(grab , bubble, repulse, none) 
            },
            onclick: {
                enable: true,
                mode: "push" // Khi click, tạo thêm hạt
            }
        },
        modes: {
            repulse: {
                distance: 100,
                duration: 0.4
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
});

 