let cellCount = 1;

function divideCell(event) {
    const container = document.querySelector('.container');
    const newCell = document.createElement('div');
    newCell.className = 'cell';
    newCell.style.left = `${event.clientX - 25}px`;
    newCell.style.top = `${event.clientY - 25}px`;
    newCell.id = `cell${++cellCount}`;
    container.appendChild(newCell);
}