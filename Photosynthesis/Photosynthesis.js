const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

// 화면 크기에 맞춰 캔버스 크기 설정
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 나무 그리기 함수
function drawTree(x, y, length, angle, branchWidth, color1, color2) {
    ctx.beginPath();
    ctx.save();

    ctx.strokeStyle = color1;
    ctx.fillStyle = color2;
    ctx.lineWidth = branchWidth;
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI/180);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length);
    ctx.stroke();

    if (length < 10) {
        ctx.restore();
        return;
    }

    drawTree(0, -length, length * 0.7, angle - 15, branchWidth * 0.7, color1, color2);
    drawTree(0, -length, length * 0.7, angle + 15, branchWidth * 0.7, color1, color2);

    ctx.restore();
}

// 나무를 그리는 버튼 클릭 이벤트
document.getElementById('drawButton').addEventListener('click', function() {
    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTree(canvas.width / 2, canvas.height, 100, 0, 10, 'brown', 'green');
});

// 창 크기가 변경될 때마다 캔버스 크기 재조정
window.addEventListener('resize', resizeCanvas);

// 초기화 시 캔버스 크기 설정
resizeCanvas();
