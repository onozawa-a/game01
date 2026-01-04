const board = document.getElementById('board');
const info = document.getElementById('info');
const boardData = [];
const SIZE = 8;
let currentPlayer = 1; // 1: black, 2: white
const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1], [1, 0], [1, 1]
];

// 盤面の初期化
function initialize() {
  for (let i = 0; i < SIZE; i++) {
    boardData[i] = [];
    for (let j = 0; j < SIZE; j++) {
      boardData[i][j] = 0;
    }
  }
  // 初期配置
  boardData[3][3] = 2; // white
  boardData[3][4] = 1; // black
  boardData[4][3] = 1; // black
  boardData[4][4] = 2; // white

  renderBoard();
}

// 盤面の描画
function renderBoard() {
  info.textContent = (currentPlayer === 1 ? "黒" : "白") + "のターン";
  board.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener('click', handleClick);

      const disc = document.createElement('div');
      if (boardData[i][j] !== 0) {
        disc.className = 'disc ' + (boardData[i][j] === 1 ? 'black' : 'white');
      }
      cell.appendChild(disc);
      board.appendChild(cell);
    }
  }
}

// クリック処理
function handleClick(event) {
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (isValidMove(row, col)) {
    boardData[row][col] = currentPlayer;
    flipDiscs(row, col);
    currentPlayer = 3 - currentPlayer; // switch player
    renderBoard();
    checkGameOver();
  }
}

// 石を置けるか判定
function isValidMove(row, col) {
  if (boardData[row][col] !== 0) {
    return false;
  }

  const opponent = 3 - currentPlayer;
  let canFlip = false;

  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    let hasOpponentDisc = false;

    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
      if (boardData[r][c] === opponent) {
        hasOpponentDisc = true;
      } else if (boardData[r][c] === currentPlayer) {
        if (hasOpponentDisc) {
          canFlip = true;
        }
        break;
      } else { // Empty cell
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return canFlip;
}

// 石を裏返す
function flipDiscs(row, col) {
  const opponent = 3 - currentPlayer;

  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    const discsToFlip = [];

    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
      if (boardData[r][c] === opponent) {
        discsToFlip.push([r, c]);
      } else if (boardData[r][c] === currentPlayer) {
        for (const [fr, fc] of discsToFlip) {
          boardData[fr][fc] = currentPlayer;
        }
        break;
      } else { // Empty cell
        break;
      }
      r += dr;
      c += dc;
    }
  }
}

// ゲーム終了かチェック
function checkGameOver() {
  let blackPass = !canPlay(1);
  let whitePass = !canPlay(2);

  if (blackPass && whitePass) {
    showResult();
    return;
  }

  if ((currentPlayer === 1 && blackPass) || (currentPlayer === 2 && whitePass)) {
    alert((currentPlayer === 1 ? "黒" : "白") + "はパスします。");
    currentPlayer = 3 - currentPlayer;
    renderBoard();
    checkGameOver(); // 相手もパスかチェック
  }
}

// 指定したプレイヤーがプレイ可能か
function canPlay(player) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      // isValidMoveはcurrentPlayerを元に判断するので一時的に変更
      const originalPlayer = currentPlayer;
      currentPlayer = player;
      if (isValidMove(i, j)) {
        currentPlayer = originalPlayer;
        return true;
      }
      currentPlayer = originalPlayer;
    }
  }
  return false;
}

// 結果表示
function showResult() {
  let blackCount = 0;
  let whiteCount = 0;
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (boardData[i][j] === 1) {
        blackCount++;
      } else if (boardData[i][j] === 2) {
        whiteCount++;
      }
    }
  }

  let resultMessage = "黒: " + blackCount + " - 白: " + whiteCount + "\n";
  if (blackCount > whiteCount) {
    resultMessage += "黒の勝ちです！";
  } else if (whiteCount > blackCount) {
    resultMessage += "白の勝ちです！";
  } else {
    resultMessage += "引き分けです。";
  }
  alert(resultMessage);
}

initialize();
