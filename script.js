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
    dice.setAttribute('data-rolled', 'false'); // 롤 상태 초기화
    const img = document.createElement('img');
    img.src = getRandomDiceImage();
    img.alt = `주사위 ${getDiceNumber(img.src)}`;
    dice.appendChild(img);
    // 초기 위치 랜덤 설정 (테이블 내부)
    setInitialPosition(dice);
    // 터치 이벤트 추가
    dice.addEventListener('click', () => rollIndividualDice(dice));
    dice.addEventListener('touchstart', (e) => {
      e.preventDefault(); // 터치 이벤트의 기본 동작 방지
      rollIndividualDice(dice);
    }, { passive: false });
    return dice;
  }

  // 주사위 초기 위치 설정 함수
  function setInitialPosition(dice) {
    const containerRect = diceContainer.getBoundingClientRect();
    const x = Math.random() * (containerRect.width - 80); // 주사위 너비 고려
    const y = Math.random() * (containerRect.height - 80); // 주사위 높이 고려
    dice.style.left = `${x}px`;
    dice.style.top = `${y}px`;
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

  // 개별 주사위 던지기 함수
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
      dice.setAttribute('data-rolled', 'true'); // 롤 상태 업데이트
    }, 600); // 1.2s 애니메이션의 600ms

    // 애니메이션이 끝난 후 클래스 제거 및 체크
    dice.addEventListener('animationend', () => {
      dice.classList.remove('throwing');
      checkAllDiceRolled(); // 모든 주사위가 롤 되었는지 확인
    }, { once: true });
  }

  // 모두 주사위 던지기 함수
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
          dice.setAttribute('data-rolled', 'true'); // 롤 상태 업데이트
        }, 600); // 1.2s 애니메이션의 600ms

        // 애니메이션이 끝난 후 합계를 업데이트하고 점수 기록
        dice.addEventListener('animationend', () => {
          dice.classList.remove('throwing');
          rollsCompleted++;
          if (rollsCompleted === totalDice) {
            updateCurrentSum();
            addScore();
            resetAllDiceRolled(); // 롤 상태 초기화
          }
        }, { once: true });
      }
    });
  }

  // 모든 주사위가 롤 되었는지 확인하는 함수
  function checkAllDiceRolled() {
    const diceList = document.querySelectorAll('.dice');
    let allRolled = true;
    diceList.forEach(dice => {
      if (dice.getAttribute('data-rolled') !== 'true') {
        allRolled = false;
      }
    });
    if (allRolled) {
      updateCurrentSum();
      addScore();
      resetAllDiceRolled(); // 롤 상태 초기화
    }
  }

  // 모든 주사위의 롤 상태를 초기화하는 함수
  function resetAllDiceRolled() {
    const diceList = document.querySelectorAll('.dice');
    diceList.forEach(dice => {
      dice.setAttribute('data-rolled', 'false');
      setInitialPosition(dice); // 다음 라운드를 위해 위치 초기화
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
    // 로컬 스토리지에 저장 (추가 개선 사항)
    localStorage.setItem('diceScores', JSON.stringify(scores));
  }

  // 점수판 업데이트 함수
  function updateScoreboard() {
    // 점수 리스트 초기화
    scoreList.innerHTML = '';
    // 모든 점수 표시 (가장 최근이 위로 오도록)
    scores.slice().reverse().forEach((score, index) => {
      const li = document.createElement('li');
      li.textContent = `#${scores.length - index}: ${score}`;
      scoreList.appendChild(li);
    });
  }

  // 점수 초기화 함수
  function clearScores() {
    if (confirm('정말로 점수를 초기화하시겠습니까?')) {
      scores = [];
      updateScoreboard();
      // 로컬 스토리지에서 제거 (추가 개선 사항)
      localStorage.removeItem('diceScores');
    }
  }

  // 주사위 추가 함수
  function addDice() {
    const newDice = createDice();
    diceContainer.appendChild(newDice);
    // 주사위를 추가한 후에도 기존 합계는 유지
  }

  // 주사위 제거 함수
  function removeDice() {
    const diceList = document.querySelectorAll('.dice');
    if (diceList.length > 0) {
      diceContainer.removeChild(diceList[diceList.length - 1]);
      // 주사위를 제거한 후에도 기존 합계는 유지
    } else {
      alert('더 이상 제거할 주사위가 없습니다!');
    }
  }

  // 이벤트 리스너 등록
  rollButton.addEventListener('click', rollAllDice);
  addDiceButton.addEventListener('click', addDice);
  removeDiceButton.addEventListener('click', removeDice);
  clearScoresButton.addEventListener('click', clearScores);

  // 로컬 스토리지에서 점수 불러오기 (추가 개선 사항)
  function loadScores() {
    const storedScores = localStorage.getItem('diceScores');
    if (storedScores) {
      scores = JSON.parse(storedScores);
      updateScoreboard();
    }
  }

  // 초기화 함수 수정
  loadScores();

  // 초기 주사위 생성 (항상 2개로 설정)
  for (let i = 0; i < 2; i++) {
    addDice();
  }
});
