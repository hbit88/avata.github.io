const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const downloadBtn = document.getElementById("download");
const resetBtn = document.getElementById("reset");
const zoomInput = document.getElementById("zoom");
const moveXInput = document.getElementById("moveX");
const moveYInput = document.getElementById("moveY");
const roundnessInput = document.getElementById("roundness");
const removeBgCheckbox = document.getElementById("remove-bg");

const BG_FRAME_SRC = "bg-frame.png";
const FG_FRAME_SRC = "fg-frame.png";
const CANVAS_SIZE = 400;

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

let userImg = null;
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let roundness = 0; // Mặc định không bo tròn
let cornerRadius = [0, 0, 0, 0]; // Mặc định bo tròn 0 tại các góc

const bgFrame = new Image();
const fgFrame = new Image();

bgFrame.src = BG_FRAME_SRC;
fgFrame.src = FG_FRAME_SRC;

let framesLoaded = 0;
function checkFramesLoaded() {
    framesLoaded++;
    if (framesLoaded === 2) {
        drawCanvas();
    }
}

bgFrame.onload = checkFramesLoaded;
fgFrame.onload = checkFramesLoaded;

// Xử lý tải ảnh lên
upload.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        userImg = new Image();
        userImg.onload = function () {
            if (removeBgCheckbox.checked) {
                removeBackground(userImg, (processedImg) => {
                    userImg = processedImg;
                    drawCanvas();
                });
            } else {
                drawCanvas();
            }
        };
        userImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Hàm xóa nền
function removeBackground(image, callback) {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;

    tempCtx.drawImage(image, 0, 0);

    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r > 200 && g > 200 && b > 200) {
            data[i + 3] = 0;
        }
    }
    
    tempCtx.putImageData(imgData, 0, 0);

    const newImg = new Image();
    newImg.onload = () => callback(newImg);
    newImg.src = tempCanvas.toDataURL();
}

// Vẽ ảnh lên canvas
function drawCanvas() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(bgFrame, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (userImg) {
        const imgWidth = userImg.width * zoom;
        const imgHeight = userImg.height * zoom;
        const imgX = CANVAS_SIZE / 2 - imgWidth / 2 + offsetX;
        const imgY = CANVAS_SIZE / 2 - imgHeight / 2 + offsetY;

        // Bo tròn các góc theo giá trị roundness
        ctx.save();
        ctx.beginPath();
        drawRoundedRect(ctx, imgX, imgY, imgWidth, imgHeight, cornerRadius);
        ctx.clip();
        ctx.drawImage(userImg, imgX, imgY, imgWidth, imgHeight);
        ctx.restore();
    }

    ctx.drawImage(fgFrame, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

// Vẽ hình chữ nhật bo tròn từng góc
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius[0], y);
    ctx.lineTo(x + width - radius[1], y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius[1]);
    ctx.lineTo(x + width, y + height - radius[2]);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius[2], y + height);
    ctx.lineTo(x + radius[3], y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius[3]);
    ctx.lineTo(x, y + radius[0]);
    ctx.quadraticCurveTo(x, y, x + radius[0], y);
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

// Cập nhật bo tròn từng góc
roundnessInput.addEventListener("input", function () {
    let value = parseFloat(this.value);
    cornerRadius = [value, value, value, value]; // Áp dụng cùng giá trị cho 4 góc
    drawCanvas();
});

// Reset về trạng thái ban đầu
resetBtn.addEventListener("click", function () {
    zoom = 1;
    offsetX = 0;
    offsetY = 0;
    cornerRadius = [0, 0, 0, 0]; // Reset bo tròn
    zoomInput.value = "1";
    moveXInput.value = "0";
    moveYInput.value = "0";
    roundnessInput.value = "0";
    userImg = null;
    drawCanvas();
});

// Xử lý tải ảnh xuống
downloadBtn.addEventListener("click", function () {
    const link = document.createElement("a");
    link.download = "avatar.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});
 