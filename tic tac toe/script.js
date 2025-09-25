const boardEl = document.getElementById('board');
const turnEl = document.getElementById('turn');
const msgEl = document.getElementById('message');
const modeEl = document.getElementById('mode');
const resetBtn = document.getElementById('reset');

let board = Array(9).fill('');
let current = 'X';
let over = false;
const AI = 'O';
const HUMAN = 'X';

function createCells() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cell';
    btn.dataset.index = i;
    btn.setAttribute('aria-label', `cell ${i + 1}`);
    btn.addEventListener('click', () => onCell(i));
    boardEl.appendChild(btn);
  }
}

function reset() {
  board.fill('');
  current = 'X';
  over = false;
  update();
  turnEl.textContent = current;
  msgEl.textContent = '';
}

function update() {
  for (let i = 0; i < 9; i++) {
    const el = boardEl.children[i];
    el.textContent = board[i];
    el.disabled = !!board[i] || over;
  }
}

function onCell(i) {
  if (over || board[i]) return;
  board[i] = current;
  afterMove();
}

function afterMove() {
  update();
  const r = checkWinner(board);
  if (r) {
    finish(r);
    return;
  }
  current = current === 'X' ? 'O' : 'X';
  turnEl.textContent = current;
  if (modeEl.value === 'pvc' && current === AI) {
    setTimeout(aiMove, 250);
  }
}

function finish(result) {
  over = true;
  if (result === 'Draw') msgEl.textContent = "It's a draw";
  else msgEl.textContent = `${result} wins`;
  update();
}

function checkWinner(s) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a, b, c] of lines) {
    if (s[a] && s[a] === s[b] && s[a] === s[c]) return s[a];
  }
  if (s.every(Boolean)) return 'Draw';
  return null;
}

function aiMove() {
  const mv = bestMove();
  if (mv === -1) {
    const empties = board.map((v,i)=> v ? null : i).filter(v=>v!==null);
    if (empties.length) board[empties[Math.floor(Math.random()*empties.length)]] = AI;
  } else {
    board[mv] = AI;
  }
  afterMove();
}

function bestMove() {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = AI;
      const score = minimax(board, HUMAN);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(s, player) {
  const result = checkWinner(s);
  if (result === AI) return 10;
  if (result === HUMAN) return -10;
  if (result === 'Draw') return 0;

  const scores = [];
  for (let i = 0; i < 9; i++) {
    if (!s[i]) {
      s[i] = player;
      const score = minimax(s, player === AI ? HUMAN : AI);
      scores.push(score);
      s[i] = '';
    }
  }
  return player === AI ? Math.max(...scores) : Math.min(...scores);
}

window.addEventListener('keydown', e => {
  const k = e.key;
  if (k >= '1' && k <= '9') {
    const i = Number(k) - 1;
    onCell(i);
  }
});

modeEl.addEventListener('change', reset);
resetBtn.addEventListener('click', reset);

createCells();
reset();
