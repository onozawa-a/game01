import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';

const SIZE = 8;
const PLAYERS = {
  NONE: 0,
  BLACK: 1,
  WHITE: 2,
};

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1], [1, 0], [1, 1],
];

const getPlayerName = (player) => (player === PLAYERS.BLACK ? '黒' : '白');

// ボードの初期化
const initializeBoard = () => {
  const board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(PLAYERS.NONE));
  board[3][3] = PLAYERS.WHITE;
  board[3][4] = PLAYERS.BLACK;
  board[4][3] = PLAYERS.BLACK;
  board[4][4] = PLAYERS.WHITE;
  return board;
};

// 指定した位置に石を置いた場合に返せる石のリストを取得（純粋関数）
const getFlippableDiscs = (row, col, player, currentBoard) => {
  if (currentBoard[row][col] !== PLAYERS.NONE) {
    return [];
  }

  const opponent = player === PLAYERS.BLACK ? PLAYERS.WHITE : PLAYERS.BLACK;
  const allFlippableDiscs = [];

  for (const [dr, dc] of DIRECTIONS) {
    let r = row + dr;
    let c = col + dc;
    const discsInDirection = [];

    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
      if (currentBoard[r][c] === opponent) {
        discsInDirection.push([r, c]);
      } else if (currentBoard[r][c] === player) {
        allFlippableDiscs.push(...discsInDirection);
        break;
      } else { // Empty cell
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return allFlippableDiscs;
};

// 石を置けるか判定
const isValidMove = (row, col, player, currentBoard) => {
  return getFlippableDiscs(row, col, player, currentBoard).length > 0;
};

// プレイヤーがどこかに置ける場所があるか判定
const canPlay = (player, currentBoard) => {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (isValidMove(i, j, player, currentBoard)) {
        return true;
      }
    }
  }
  return false;
};

// スコア計算
const calculateScores = (currentBoard) => {
  let black = 0;
  let white = 0;
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (currentBoard[i][j] === PLAYERS.BLACK) black++;
      if (currentBoard[i][j] === PLAYERS.WHITE) white++;
    }
  }
  return { black, white };
};

// ゲームロジックを管理するカスタムフック
const useOthelloGame = () => {
  const [board, setBoard] = useState(initializeBoard);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYERS.BLACK);
  const [gameOver, setGameOver] = useState(false);
  const [passInfo, setPassInfo] = useState({ open: false, message: '' });

  // スコアはボードの状態から算出する（派生ステート）
  const scores = useMemo(() => calculateScores(board), [board]);

  const handleCellClick = (row, col) => {
    if (gameOver || !isValidMove(row, col, currentPlayer, board)) {
      return;
    }

    const newBoard = board.map(r => [...r]);
    const flippableDiscs = getFlippableDiscs(row, col, currentPlayer, newBoard);

    newBoard[row][col] = currentPlayer;
    flippableDiscs.forEach(([r, c]) => {
      newBoard[r][c] = currentPlayer;
    });

    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === PLAYERS.BLACK ? PLAYERS.WHITE : PLAYERS.BLACK);
  };

  useEffect(() => {
    if (gameOver) return;

    const opponent = currentPlayer === PLAYERS.BLACK ? PLAYERS.WHITE : PLAYERS.BLACK;

    if (!canPlay(currentPlayer, board)) {
      if (!canPlay(opponent, board)) {
        // Game Over
        setGameOver(true);
      } else {
        // Pass
        setPassInfo({ open: true, message: `${getPlayerName(currentPlayer)}はパスします。` });
        setCurrentPlayer(opponent);
      }
    }
  }, [board, currentPlayer, gameOver]);

  const handleReset = () => {
    setBoard(initializeBoard());
    setCurrentPlayer(PLAYERS.BLACK);
    setGameOver(false);
    setPassInfo({ open: false, message: '' });
  };

  return {
    board,
    currentPlayer,
    gameOver,
    scores,
    passInfo,
    setPassInfo,
    handleCellClick,
    handleReset,
  };
};

const OthelloGame = () => {
  const {
    board,
    currentPlayer,
    gameOver,
    scores,
    passInfo,
    setPassInfo,
    handleCellClick,
    handleReset,
  } = useOthelloGame();

  const getResultMessage = () => {
    if (scores.black > scores.white) return `黒の勝ちです！`;
    if (scores.white > scores.black) return `白の勝ちです！`;
    return '引き分けです。';
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        オセロ
      </Typography>

      {!gameOver && (
        <Typography variant="h6" gutterBottom>
          {getPlayerName(currentPlayer)} のターン
        </Typography>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          width: '100%',
          maxWidth: '500px',
          aspectRatio: '1 / 1',
          backgroundColor: 'green',
          border: '2px solid black',
          margin: 'auto',
        }}
      >
        {board.map((row, i) =>
          row.map((cell, j) => (
            <Box
              key={`${i}-${j}`}
              onClick={() => handleCellClick(i, j)}
              sx={{
                border: '1px solid black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: !gameOver && isValidMove(i, j, currentPlayer, board) ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor: !gameOver && isValidMove(i, j, currentPlayer, board) ? 'lightgreen' : 'transparent',
                },
              }}
            >
              {cell !== PLAYERS.NONE && (
                <Box
                  sx={{
                    width: '80%',
                    height: '80%',
                    borderRadius: '50%',
                    backgroundColor: cell === PLAYERS.BLACK ? 'black' : 'white',
                  }}
                />
              )}
            </Box>
          ))
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">
          黒: {scores.black} - 白: {scores.white}
        </Typography>
      </Box>

      <Dialog open={gameOver} onClose={() => setGameOver(false)}>
        <DialogTitle>ゲーム終了</DialogTitle>
        <DialogContent>
          <DialogContentText>
            黒: {scores.black} - 白: {scores.white}
            <br />
            {getResultMessage()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReset} autoFocus>
            もう一度プレイ
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={passInfo.open}
        autoHideDuration={3000}
        onClose={() => setPassInfo({ ...passInfo, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setPassInfo({ ...passInfo, open: false })}
          severity="info"
          sx={{ width: '100%' }}
        >
          {passInfo.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OthelloGame;
