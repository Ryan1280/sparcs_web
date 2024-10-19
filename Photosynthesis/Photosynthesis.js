const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 설정 (1920x1080)
canvas.width = 1920;
canvas.height = 1080;

// 단계 설정
let stage = 0; // 0: 빈 화면, 1: 나무 성장, 2: 벚꽃 피기, 3: 비 오기, 4: 비 그친 후 색상 변화

// 나무 데이터
let branches = [];
let maxDepth = 10;
let growthProgress = 0; // 성장 진행도 (0~1)
let colorProgress = 0;  // 색상 변화 진행도 (0~1)

// 애니메이션 프레임 관리
let animationFrame;

// 비 상태 관리
let raindrops = [];
let isRaining = false;

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
        animateColorChange();
    } else if (stage === 3) {
        isRaining = true;
        createRain();
        animateRain();
    } else if (stage === 4) {
        isRaining = false;
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

        // 나무가 땅 위에서 자라도록 시작 위치 조정
        const startY = canvas.height - 50; // 땅 위에서 시작
        drawBranch(
            canvas.width / 2,  // x 시작 위치
            startY,            // y 시작 위치
            -90,               // 수직 방향 (위쪽)
            maxDepth,
            0                  // 현재 깊이
        );
        drawScene();
        animationFrame = requestAnimationFrame(growTree);
    } else {
        cancelAnimationFrame(animationFrame);
        drawScene();
    }
}

// 나무 가지 생성
function drawBranch(x, y, angle, depth, currentDepth) {
    if (currentDepth > depth) return;

    // 성장 진행도에 따른 가지의 현재 깊이 계산
    const progressDepth = growthProgress * maxDepth;
    if (currentDepth > progressDepth) return;

    // 나뭇가지 길이 계산
    const maxBranchLength = 100;
    const length = maxBranchLength * (1 - currentDepth / maxDepth);

    // 현재 가지의 성장 비율 계산
    const depthGrowth = Math.min(1, (growthProgress * maxDepth - currentDepth));

    const currentLength = length * depthGrowth;

    // 끝점 계산
    const endX = x + currentLength * Math.cos(angle * Math.PI / 180);
    const endY = y + currentLength * Math.sin(angle * Math.PI / 180);

    // 나뭇가지 정보 저장
    branches.push({
        startX: x,
        startY: y,
        endX: endX,
        endY: endY,
        depth: currentDepth,
        thickness: (maxDepth - currentDepth) * 0.8  // 나뭇가지 두께 감소
    });

    // 좌우 가지 생성
    if (depthGrowth >= 1) {
        const branchAngle = 20;  // 가지 각도 조절
        drawBranch(endX, endY, angle - branchAngle, depth, currentDepth + 1);
        drawBranch(endX, endY, angle + branchAngle, depth, currentDepth + 1);
    }
}

// 나무 그리기
function renderTree() {
    branches.forEach(branch => {
        let color = 'white';

        if (stage === 2 || (stage === 3 && colorProgress < 1)) {
            // 벚꽃 피기 및 비 오는 동안 분홍색 유지
            const ratio = colorProgress;
            const red = 255;
            const green = 255 - (63 * ratio); // 255 -> 192
            const blue = 255 - (52 * ratio);  // 255 -> 203
            color = `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
        } else if (stage === 4) {
            // 비 그친 후 색상 변화 (분홍색 -> 흰색 -> 초록색)
            if (colorProgress < 0.5) {
                // 분홍색에서 흰색으로
                const ratio = (colorProgress / 0.5);
                const red = 255;
                const green = 192 + (63 * ratio); // 192 -> 255
                const blue = 203 + (52 * ratio);  // 203 -> 255
                color = `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
            } else {
                // 흰색에서 초록색으로
                const ratio = ((colorProgress - 0.5) / 0.5);
                if (branch.depth < maxDepth / 2) {
                    // 잎 부분만 초록색으로 변경
                    const red = 255 * (1 - ratio);   // 255 -> 0
                    const green = 255;                // 255 유지
                    const blue = 255 * (1 - ratio);   // 255 -> 0
                    color = `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
                } else {
                    // 줄기는 흰색 유지
                    color = 'white';
                }
            }
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = branch.thickness;
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
function animateColorChange() {
    if (colorProgress < 1) {
        colorProgress += 0.005; // 색상 변화 속도 조절 (느리게)
        drawScene();
        animationFrame = requestAnimationFrame(animateColorChange);
    } else {
        cancelAnimationFrame(animationFrame);
        if (stage === 3) {
            isRaining = true;
            createRain();
            animateRain();
        } else if (stage === 4) {
            drawScene();
        }
    }
}

// 비 애니메이션
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
    if (raindrops.length > 0 || isRaining) {
        animationFrame = requestAnimationFrame(animateRain);
    } else {
        cancelAnimationFrame(animationFrame);
        colorProgress = 0;
        animateColorChange();
    }
}

// 비 그리기
function drawRain() {
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 1;
    for (let i = raindrops.length - 1; i >= 0; i--) {
        const drop = raindrops[i];
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
        drop.y += drop.speed;
        if (drop.y > canvas.height) {
            if (isRaining) {
                // 비가 오는 동안에는 빗방울을 위로 재생성
                drop.y = Math.random() * -canvas.height;
            } else {
                // 비가 그치면 빗방울 제거
                raindrops.splice(i, 1);
            }
        }
    }
}

// 애니메이션 종료
function stopAnimation() {
    cancelAnimationFrame(animationFrame);
}
