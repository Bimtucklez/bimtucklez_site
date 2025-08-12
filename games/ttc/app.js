/* Geocache Tic Tac Toe - app.js
   Features:
   - 2 player (local) or vs computer
   - Difficulty: easy (random), medium (winning/blocking heuristics), hard (minimax)
   - Uses local SVG icons (geocache images) for markers
   - Mobile-friendly touch support
*/

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const newBtn = document.getElementById('newGame');
const difficultySel = document.getElementById('difficulty');
const modeRadios = document.getElementsByName('mode');

let board = Array(9).fill(null);
let current = 'X'; // X always starts (player)
let running = false;
let vsComputer = true;

const ICONS = {
  X: 'assets/geocache_x.svg',
  O: 'assets/geocache_o.svg'
};

function createBoard(){
  boardEl.innerHTML = '';
  for(let i=0;i<9;i++){
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.setAttribute('role','gridcell');
    cell.addEventListener('click', onCellClick);
    boardEl.appendChild(cell);
  }
}

function onCellClick(e){
  if(!running) return;
  const idx = Number(e.currentTarget.dataset.index);
  if(board[idx]) return;
  makeMove(idx, current);
  render();
  checkState();
  if(running && vsComputer && current === 'O'){
    // small delay for feel
    setTimeout(computerTurn, 350);
  }
}

function makeMove(i, player){
  board[i] = player;
  current = player === 'X' ? 'O' : 'X';
}

function render(){
  board.forEach((val,i)=>{
    const cell = boardEl.querySelector(`[data-index='${i}']`);
    cell.innerHTML = '';
    if(val){
      const img = document.createElement('img');
      img.src = ICONS[val];
      img.alt = val;
      cell.appendChild(img);
    }
  });
}

function checkState(){
  const winLines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for(const line of winLines){
    const [a,b,c] = line;
    if(board[a] && board[a] === board[b] && board[b] === board[c]){
      running = false;
      highlightLine(line);
      statusEl.textContent = (board[a] === 'X' ? 'Player (X)' : (vsComputer ? 'Computer (O)' : 'Player 2 (O)')) + ' wins!';
      return;
    }
  }
  if(board.every(Boolean)){
    running = false;
    statusEl.textContent = 'It\'s a tie.';
  } else {
    statusEl.textContent = (current === 'X' ? (vsComputer ? 'Player (X) turn' : 'Player 1 (X) turn') : (vsComputer ? 'Computer (O) turn' : 'Player 2 (O) turn'));
  }
}

function highlightLine(line){
  line.forEach(i=>{
    const cell = boardEl.querySelector(`[data-index='${i}']`);
    cell.style.boxShadow = 'inset 0 0 0 3px rgba(245,158,11,0.14)';
  });
}

function startNew(){
  board = Array(9).fill(null);
  current = 'X';
  running = true;
  vsComputer = Array.from(modeRadios).find(r=>r.checked).value === 'pvc';
  createBoard();
  render();
  statusEl.textContent = (current === 'X' ? (vsComputer ? 'Player (X) turn' : 'Player 1 (X) turn') : 'O turn');
  // if computer goes first in the future, handle here
}

// Computer play strategies
function computerTurn(){
  const diff = difficultySel.value;
  let move;
  if(diff === 'easy'){
    move = randomMove();
  } else if(diff === 'medium'){
    move = mediumMove();
  } else {
    move = bestMoveMinimax(board.slice(), 'O');
  }
  if(move != null){
    makeMove(move, 'O');
    render();
    checkState();
  }
}

function randomMove(){
  const empty = board.map((v,i)=>v?null:i).filter(v=>v!==null);
  if(empty.length===0) return null;
  return empty[Math.floor(Math.random()*empty.length)];
}

function mediumMove(){
  // 1) can win?
  for(let i=0;i<9;i++){
    if(!board[i]){
      const copy = board.slice(); copy[i]='O';
      if(isWinner(copy,'O')) return i;
    }
  }
  // 2) block X
  for(let i=0;i<9;i++){
    if(!board[i]){
      const copy = board.slice(); copy[i]='X';
      if(isWinner(copy,'X')) return i;
    }
  }
  // 3) take center
  if(!board[4]) return 4;
  // 4) take corner
  const corners=[0,2,6,8].filter(i=>!board[i]);
  if(corners.length) return corners[Math.floor(Math.random()*corners.length)];
  // else random
  return randomMove();
}

function isWinner(bd, player){
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return lines.some(([a,b,c])=>bd[a]===player && bd[b]===player && bd[c]===player);
}

// minimax for hard
function bestMoveMinimax(bd, player){
  // returns index
  const avail = bd.map((v,i)=>v?null:i).filter(v=>v!==null);
  if(avail.length===9) return [0,2,4,6,8][Math.floor(Math.random()*5)]; // choose random corner/center start
  let bestScore = -Infinity;
  let move = null;
  for(const i of avail){
    bd[i] = player;
    const score = minimax(bd, 0, false);
    bd[i] = null;
    if(score > bestScore){
      bestScore = score; move = i;
    }
  }
  return move;
}

function minimax(bd, depth, isMax){
  if(isWinner(bd,'O')) return 10 - depth;
  if(isWinner(bd,'X')) return depth - 10;
  if(bd.every(Boolean)) return 0;

  const avail = bd.map((v,i)=>v?null:i).filter(v=>v!==null);
  if(isMax){
    let best = -Infinity;
    for(const i of avail){
      bd[i]='O';
      best = Math.max(best, minimax(bd, depth+1, false));
      bd[i]=null;
    }
    return best;
  } else {
    let best = Infinity;
    for(const i of avail){
      bd[i]='X';
      best = Math.min(best, minimax(bd, depth+1, true));
      bd[i]=null;
    }
    return best;
  }
}

// wire up controls
newBtn.addEventListener('click', startNew);
Array.from(modeRadios).forEach(r=>r.addEventListener('change', ()=>{
  // hide difficulty in pvp
  const pvp = Array.from(modeRadios).find(r=>r.checked).value === 'pvp';
  difficultySel.disabled = pvp;
}));

// init
createBoard();
startNew();

