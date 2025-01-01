// script.js

document.addEventListener('DOMContentLoaded', () => {
  const diceContainer = document.getElementById('dice-container');
  const rollButton = document.getElementById('roll-button');
  const addDiceButton = document.getElementById('add-dice');
  const removeDiceButton = document.getElementById('remove-dice');
  const rollSound = document.getElementById('roll-sound');
  const scoreList = document.getElementById('score-list');
  const clearScoresButton = document.getElementById('clear-scores');
  const currentSumDisplay = document.getElementById('current-sum');

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
    dice.addEventListener('click', () => rollIndividualDice(dice));
    dice.addEventListener('touchstart', (e) => {
      e.preventDefault(); // 터치 이벤트의 기본 동작 방지
      rollIndividualDice(dice);
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

  // 개별 주사위 던지기 함수 (합계 및 기록 미업데이트)
  function rollIndividualDice(dice) {
    if (dice.classList.contains('throwing')) return; // 애니메이션 중복 방지
    dice.classList.add('throwing');
    rollSound.currentTime = 0;
    rollSound.play();

    // 애니메이션 중간(50%)에 숫자 변경
    setTimeout(() => {
      const img = dice.querySelector('img');
      const newImage = getRandomDiceImage();
      img.src = newImage;
      img.alt = `주사위 ${getDiceNumber(newImage)}`;
    }, 600); // 50% 시점 (1.2s 애니메이션의 600ms)

    // 애니메이션이 끝난 후 클래스 제거
    dice.addEventListener('animationend', () => {
      dice.classList.remove('throwing');
      // 합계 및 점수 기록은 "모두 던지기"에서만 수행
    }, { once: true });
  }

  // 모두 주사위 던지기 함수 (합계 및 기록 수행)
  function rollAllDice() {
    const diceList = document.querySelectorAll('.dice');
    if (diceList.length === 0) {
      alert('주사위가 없습니다! "주사위 추가" 버튼을 눌러 주사위를 추가하세요.');
      return;
    }

    let rollsCompleted = 0;
    const totalDice = diceList.length;

    diceList.forEach(dice => {
      if (!dice.classList.contains('throwing')) {
        dice.classList.add('throwing');
        rollSound.currentTime = 0;
        rollSound.play();

        // 애니메이션 중간(50%)에 숫자 변경
        setTimeout(() => {
          const img = dice.querySelector('img');
          const newImage = getRandomDiceImage();
          img.src = newImage;
          img.alt = `주사위 ${getDiceNumber(newImage)}`;
        }, 600); // 50% 시점 (1.2s 애니메이션의 600ms)

        // 애니메이션이 끝난 후 합계를 업데이트하고 점수 기록
        dice.addEventListener('animationend', () => {
          dice.classList.remove('throwing');
          rollsCompleted++;
          if (rollsCompleted === totalDice) {
            updateCurrentSum();
            addScore();
          }
        }, { once: true });
      }
    });
  }

  // 현재 합계 업데이트 함수
  function updateCurrentSum() {
    const diceList = document.querySelectorAll('.dice img');
    let sum = 0;
    diceList.forEach(img => {
      const num = getDiceNumber(img.src);
      if (typeof num === 'number') {
        sum += num;
      }
    });
    // 애니메이션 효과 추가
    currentSumDisplay.classList.add('updating');
    currentSumDisplay.textContent = `합계: ${sum}`;
    setTimeout(() => {
      currentSumDisplay.classList.remove('updating');
    }, 500);
  }

  // 점수 추가 함수
  function addScore() {
    const currentSum = parseInt(currentSumDisplay.textContent.replace('합계: ', '')) || 0;
    scores.push(currentSum);
    updateScoreboard();
  }

  // 점수판 업데이트 함수
  function updateScoreboard() {
    // 점수 리스트 초기화
    scoreList.innerHTML = '';
    // 최신 5개의 점수만 표시
    const recentScores = scores.slice(-5).reverse();
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
    // 초기 합계는 이전 합계를 유지
  }

  // 주사위 제거 함수
  function removeDice() {
    const diceList = document.querySelectorAll('.dice');
    if (diceList.length > 0) {
      diceContainer.removeChild(diceList[diceList.length - 1]);
      // 합계는 이전 합계를 유지
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
