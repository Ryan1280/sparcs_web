const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 설정 (1920x1080)
canvas.width = 1920;
canvas.height = 1080;

// 단계 설정
let stage = 0; // 0: 빈 화면, 1: 나무 성장, 2: 벚꽃 피기, 3: 비 오기, 4: 색상 변화

// 나무 데이터
let branches = [];
let maxDepth = 10;
let growthProgress = 0; // 성장 진행도 (0~1)
let colorProgress = 0;  // 색상 변화 진행도 (0~1)

// 애니메이션 프레임 관리
let animationFrame;

// 클릭 이벤트
canvas.addEventListener('click', () => {
    stage++;
    if (stage > 4) {
        stage = 1;
        resetTree();
        growTree();
    } else if (stage === 1) {
        resetTree();
        growTree();
    } else if (stage === 2) {
        colorProgress = 0;
        animateColorChange('pink');
    } else if (stage === 3) {
        createRain();
        animateRain();
    } else if (stage === 4) {
        colorProgress = 0;
        stopRain();
    }
});

// 초기 상태 그리기
drawScene();

// 바닥 그리기 (평면)
function drawGround() {
    ctx.fillStyle = '#555';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
}

// 나무 초기화
function resetTree() {
    branches = [];
    growthProgress = 0;
    colorProgress = 0;
    cancelAnimationFrame(animationFrame);
}

// 나무 성장 애니메이션
function growTree() {
    if (growthProgress < 1) {
        growthProgress += 0.005; // 성장 속도 조절
        branches = [];
        drawBranch(canvas.width / 2, canvas.height - 50, -90, maxDepth, growthProgress);
        drawScene();
        animationFrame = requestAnimationFrame(growTree);
    } else {
        cancelAnimationFrame(animationFrame);
        drawScene();
    }
}

// 나무 가지 생성
function drawBranch(startX, startY, angle, depth, progress) {
    if (depth === 0) return;

    // 나무 최대 높이 설정 (전체 화면의 2/3)
    const maxTreeHeight = canvas.height * 2 / 3;

    // 현재 나무의 높이 계산
    const currentTreeHeight = (canvas.height - 50) - startY;

    // 높이 제한 체크
    if (currentTreeHeight > maxTreeHeight) return;

    // 나뭇가지 길이 계산
    const length = (maxTreeHeight / maxDepth) * progress;

    // 끝점 계산
    const endX = startX + length * Math.cos(angle * Math.PI / 180);
    const endY = startY + length * Math.sin(angle * Math.PI / 180);

    // 나뭇가지 정보 저장
    branches.push({
        startX,
        startY,
        endX,
        endY,
        depth,
        angle
    });

    // 성장 애니메이션을 위해 가지 하나만 위로 성장
    if (depth === maxDepth) {
        // 맨 위 가지에서 좌우로 가지치기 시작
        drawBranch(endX, endY, angle - 15, depth - 1, progress);
        drawBranch(endX, endY, angle + 15, depth - 1, progress);
    } else {
        // 약간의 각도 변경으로 자연스러운 성장 표현
        drawBranch(endX, endY, angle - 5, depth - 1, progress);
        drawBranch(endX, endY, angle + 5, depth - 1, progress);
    }
}

// 나무 그리기
function renderTree() {
    branches.forEach(branch => {
        let color = 'white';

        if (stage === 2 || stage === 3) {
            // 벚꽃 피기 및 비 오는 동안 분홍색 유지
            const ratio = ((maxDepth - branch.depth) / maxDepth);
            const red = Math.floor(255);
            const green = Math.floor(255 - 63 * ratio);
            const blue = Math.floor(255 - 52 * ratio);
            color = `rgb(${red}, ${green}, ${blue})`;
        } else if (stage === 4) {
            // 비 그친 후 색상 변화 (분홍색 -> 흰색 -> 초록색)
            if (colorProgress < 0.5) {
                // 분홍색에서 흰색으로
                const ratio = (colorProgress / 0.5) * ((maxDepth - branch.depth) / maxDepth);
                const red = Math.floor(255);
                const green = Math.floor((192 + 63 * ratio));
                const blue = Math.floor((203 + 52 * ratio));
                color = `rgb(${red}, ${green}, ${blue})`;
            } else {
                // 흰색에서 초록색으로
                const ratio = ((colorProgress - 0.5) / 0.5) * ((maxDepth - branch.depth) / maxDepth);
                if (branch.depth > maxDepth / 2) {
                    // 아래 부분은 흰색 유지
                    color = 'white';
                } else {
                    const red = Math.floor(255 * (1 - ratio));
                    const green = Math.floor(255 * ratio);
                    const blue = Math.floor(255 * (1 - ratio));
                    color = `rgb(${red}, ${green}, ${blue})`;
                }
            }
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = branch.depth * 0.5; // 가지 두께 감소
        ctx.beginPath();
        ctx.moveTo(branch.startX, branch.startY);
        ctx.lineTo(branch.endX, branch.endY);
        ctx.stroke();
    });
}

// 씬 그리기
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    renderTree();
}

// 색상 변화 애니메이션
function animateColorChange(targetColor) {
    if (colorProgress < 1) {
        colorProgress += 0.005; // 색상 변화 속도 조절
        drawScene();
        animationFrame = requestAnimationFrame(() => animateColorChange(targetColor));
    } else {
        cancelAnimationFrame(animationFrame);
        if (stage === 3) {
            createRain();
            animateRain();
        } else if (stage === 4) {
            drawScene();
        }
    }
}

// 비 애니메이션
let raindrops = [];
function createRain() {
    raindrops = [];
    for (let i = 0; i < 300; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            length: Math.random() * 20 + 10,
            speed: Math.random() * 5 + 5
        });
    }
}

function animateRain() {
    drawScene();
    drawRain();
    animationFrame = requestAnimationFrame(animateRain);
}

// 비 그리기
function drawRain() {
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 1;
    raindrops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
        drop.y += drop.speed;
        if (drop.y > canvas.height) {
            drop.y = Math.random() * -canvas.height;
        }
    });
}

// 비 멈추기 및 색상 변화 시작
function stopRain() {
    if (raindrops.length > 0) {
        raindrops.forEach((drop, index) => {
            drop.speed *= 0.98; // 비의 속도를 점차 감소시킴
            if (drop.speed < 0.5) {
                raindrops.splice(index, 1);
            }
        });
        drawScene();
        drawRain();
        animationFrame = requestAnimationFrame(stopRain);
    } else {
        cancelAnimationFrame(animationFrame);
        colorProgress = 0;
        animateColorChange('green');
    }
}

// 애니메이션 종료
function stopAnimation() {
    cancelAnimationFrame(animationFrame);
}
