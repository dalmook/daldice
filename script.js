// script.js

document.addEventListener('DOMContentLoaded', () => {
  const diceContainer = document.getElementById('dice-container');
  const rollButton = document.getElementById('roll-button');
  const addDiceButton = document.getElementById('add-dice');
  const removeDiceButton = document.getElementById('remove-dice');
  const rollSound = document.getElementById('roll-sound');
  const scoreList = document.getElementById('score-list');
  const clearScoresButton = document.getElementById('clear-scores');

  // 주사위 이미지 경로 배열
  const diceImages = [
    'images/dice1.png',
    'images/dice2.png',
    'images/dice3.png',
    'images/dice4.png',
    'images/dice5.png',
    'images/dice6.png'
  ];

  // 점수 기록 배열
  let scores = [];

  // 주사위 생성 함수
  function createDice() {
    const dice = document.createElement('div');
    dice.classList.add('dice');
    const img = document.createElement('img');
    img.src = getRandomDiceImage();
    img.alt = `주사위 ${getDiceNumber(img.src)}`;
    dice.appendChild(img);
    // 터치 이벤트 추가
    dice.addEventListener('click', () => rollDice(dice));
    dice.addEventListener('touchstart', (e) => {
      e.preventDefault(); // 터치 이벤트의 기본 동작 방지
      rollDice(dice);
    }, { passive: false });
    return dice;
  }

  // 랜덤 주사위 이미지 선택 함수
  function getRandomDiceImage() {
    const index = Math.floor(Math.random() * 6);
    return diceImages[index];
  }

  // 주사위 숫자 추출 함수
  function getDiceNumber(src) {
    const match = src.match(/dice(\d)\.png$/);
    return match ? parseInt(match[1]) : '?';
  }

  // 주사위 던지기 함수
  function rollDice(dice) {
    if (dice.classList.contains('throwing')) return; // 애니메이션 중복 방지
    dice.classList.add('throwing');
    rollSound.currentTime = 0;
    rollSound.play();
    
    // 애니메이션이 끝난 후 새로운 숫자 설정 및 점수 기록
    dice.addEventListener('animationend', () => {
      dice.classList.remove('throwing');
      const img = dice.querySelector('img');
      const newImage = getRandomDiceImage();
      img.src = newImage;
      img.alt = `주사위 ${getDiceNumber(newImage)}`;
      const rolledNumber = getDiceNumber(newImage);
      addScore(rolledNumber);
    }, { once: true });
  }

  // 모든 주사위 던지기 함수
  function rollAllDice() {
    const diceList = document.querySelectorAll('.dice');
    if (diceList.length === 0) {
      alert('주사위가 없습니다! "주사위 추가" 버튼을 눌러 주사위를 추가하세요.');
      return;
    }
    diceList.forEach(dice => rollDice(dice));
  }

  // 점수 추가 함수
  function addScore(number) {
    scores.push(number);
    updateScoreboard();
  }

  // 점수판 업데이트 함수
  function updateScoreboard() {
    // 점수 리스트 초기화
    scoreList.innerHTML = '';
    // 최신 20개의 점수만 표시
    const recentScores = scores.slice(-20).reverse();
    recentScores.forEach((score, index) => {
      const li = document.createElement('li');
      li.textContent = `#${scores.length - recentScores.length + index + 1}: ${score}`;
      scoreList.appendChild(li);
    });
  }

  // 점수 초기화 함수
  function clearScores() {
    if (confirm('정말로 점수를 초기화하시겠습니까?')) {
      scores = [];
      updateScoreboard();
    }
  }

  // 주사위 추가 함수
  function addDice() {
    const newDice = createDice();
    diceContainer.appendChild(newDice);
  }

  // 주사위 제거 함수
  function removeDice() {
    const diceList = document.querySelectorAll('.dice');
    if (diceList.length > 0) {
      diceContainer.removeChild(diceList[diceList.length - 1]);
    } else {
      alert('더 이상 제거할 주사위가 없습니다!');
    }
  }

  // 이벤트 리스너 등록
  rollButton.addEventListener('click', rollAllDice);
  addDiceButton.addEventListener('click', addDice);
  removeDiceButton.addEventListener('click', removeDice);
  clearScoresButton.addEventListener('click', clearScores);

  // 초기 주사위 생성 (예: 2개)
  for (let i = 0; i < 2; i++) {
    addDice();
  }
});
