// script.js

document.addEventListener('DOMContentLoaded', () => {
  // Matter.js 모듈 추출
  const Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Events = Matter.Events;

  // Matter.js 엔진 및 렌더러 생성
  const engine = Engine.create();
  const render = Render.create({
    element: document.getElementById('dice-canvas'),
    engine: engine,
    options: {
      width: document.getElementById('dice-canvas').clientWidth,
      height: document.getElementById('dice-canvas').clientHeight,
      wireframes: false, // 실제 이미지를 사용하기 위해 wireframes 끔
      background: 'transparent' // 테이블 배경과 자연스럽게 어우러지도록 투명하게 설정
    }
  });

  // 엔진 및 렌더러 실행
  Engine.run(engine);
  Render.run(render);

  // 바닥 (테이블 표면) 생성
  const tableWidth = render.options.width;
  const tableHeight = render.options.height;
  const ground = Bodies.rectangle(tableWidth / 2, tableHeight - 10, tableWidth, 20, {
    isStatic: true,
    render: {
      fillStyle: '#1B5E20' // 테이블 바닥 색상과 일치
    }
  });
  World.add(engine.world, ground);

  // 주사위 배열
  let diceArray = [];

  // 점수 기록 배열
  let scores = [];

  // 주사위 생성 함수
  function createDice() {
    const diceSize = 40; // 주사위 크기 (픽셀 기준)
    const dice = Bodies.rectangle(
      Math.random() * (tableWidth - diceSize * 2) + diceSize, // 랜덤 X 위치
      Math.random() * (tableHeight / 2), // 랜덤 Y 위치 (테이블 상단 절반)
      diceSize,
      diceSize,
      {
        restitution: 0.6, // 반발력 (높을수록 튕기는 정도)
        friction: 0.3, // 마찰력
        density: 0.002, // 밀도
        render: {
          sprite: {
            texture: getRandomDiceImage(),
            xScale: 0.1, // 주사위 이미지 크기 조정
            yScale: 0.1
          }
        }
      }
    );
    World.add(engine.world, dice);
    diceArray.push(dice);
  }

  // 주사위 이미지 경로 배열
  const diceImages = [
    'images/dice1.png',
    'images/dice2.png',
    'images/dice3.png',
    'images/dice4.png',
    'images/dice5.png',
    'images/dice6.png'
  ];

  // 랜덤 주사위 이미지 선택 함수
  function getRandomDiceImage() {
    const index = Math.floor(Math.random() * diceImages.length);
    return diceImages[index];
  }

  // 주사위 숫자 추출 함수
  function getDiceNumber(texture) {
    const match = texture.match(/dice(\d)\.png$/);
    return match ? parseInt(match[1]) : '?';
  }

  // 모두 던지기 함수
  function rollAllDice() {
    if (diceArray.length === 0) {
      alert('주사위가 없습니다! "주사위 추가" 버튼을 눌러 주사위를 추가하세요.');
      return;
    }

    // 모든 주사위에 위쪽으로 힘을 가함
    diceArray.forEach(dice => {
      // 무작위 방향으로 힘을 가함
      const forceMagnitude = 0.05;
      const angle = Math.random() * Math.PI * 2;
      Body.applyForce(dice, dice.position, {
        x: forceMagnitude * Math.cos(angle),
        y: -forceMagnitude * Math.sin(angle)
      });
    });

    // 사운드 효과 재생
    const rollSound = document.getElementById('roll-sound');
    rollSound.currentTime = 0;
    rollSound.play();
  }

  // 점수판 업데이트 함수
  function updateScoreboard() {
    const scoreList = document.getElementById('score-list');
    scoreList.innerHTML = ''; // 기존 점수 초기화

    // 최신 점수부터 표시
    scores.slice().reverse().forEach((score, index) => {
      const li = document.createElement('li');
      li.textContent = `#${scores.length - index}: ${score}`;
      scoreList.appendChild(li);
    });

    // 로컬 스토리지에 저장
    localStorage.setItem('diceScores', JSON.stringify(scores));

    // 현재 합계 업데이트
    const sum = scores.reduce((acc, val) => acc + val, 0);
    const currentSumDisplay = document.getElementById('current-sum');
    currentSumDisplay.textContent = `합계: ${sum}`;
    currentSumDisplay.classList.add('updating');
    setTimeout(() => {
      currentSumDisplay.classList.remove('updating');
    }, 500);
  }

  // 점수 초기화 함수
  function clearScores() {
    if (confirm('정말로 점수를 초기화하시겠습니까?')) {
      scores = [];
      updateScoreboard();
      // 로컬 스토리지에서 제거
      localStorage.removeItem('diceScores');
    }
  }

  // 주사위 추가 함수
  function addDice() {
    createDice();
    updateScoreboard();
  }

  // 주사위 제거 함수
  function removeDice() {
    if (diceArray.length > 0) {
      const dice = diceArray.pop();
      World.remove(engine.world, dice);
      updateScoreboard();
    } else {
      alert('더 이상 제거할 주사위가 없습니다!');
    }
  }

  // 충돌 이벤트 설정 (주사위가 바닥에 닿았을 때 점수 기록)
  Events.on(engine, 'collisionStart', event => {
    const pairs = event.pairs;

    pairs.forEach(pair => {
      const { bodyA, bodyB } = pair;

      // 바닥과 주사위의 충돌 확인
      if ((bodyA === ground && isDice(bodyB)) || (bodyB === ground && isDice(bodyA))) {
        const dice = isDice(bodyA) ? bodyA : bodyB;
        const texture = dice.render.sprite.texture;
        const score = getDiceNumber(texture);
        if (score !== '?') {
          scores.push(score);
          updateScoreboard();
        }
      }
    });
  });

  // 주사위인지 확인하는 함수
  function isDice(body) {
    return diceImages.includes(body.render.sprite.texture);
  }

  // 페이지 로드 시 로컬 스토리지에서 점수 불러오기
  function loadScores() {
    const storedScores = localStorage.getItem('diceScores');
    if (storedScores) {
      scores = JSON.parse(storedScores);
      updateScoreboard();
    }
  }

  // 초기화 함수
  function initialize() {
    loadScores();

    // 초기 주사위 생성 (항상 2개로 설정)
    for (let i = 0; i < 2; i++) {
      addDice();
    }
  }

  // 초기화 실행
  initialize();

  // 이벤트 리스너 등록
  document.getElementById('roll-button').addEventListener('click', rollAllDice);
  document.getElementById('add-dice').addEventListener('click', addDice);
  document.getElementById('remove-dice').addEventListener('click', removeDice);
  document.getElementById('clear-scores').addEventListener('click', clearScores);

  // 창 크기 변경 시 Matter.js 렌더러 크기 조정
  window.addEventListener('resize', () => {
    render.options.width = document.getElementById('dice-canvas').clientWidth;
    render.options.height = document.getElementById('dice-canvas').clientHeight;
    Render.setPixelRatio(render, window.devicePixelRatio);
    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: render.options.width, y: render.options.height }
    });
    // 바닥 위치 및 크기 업데이트
    Matter.Body.setPosition(ground, { x: render.options.width / 2, y: render.options.height - 10 });
    Matter.Body.setVertices(ground, [
      { x: 0, y: render.options.height - 20 },
      { x: render.options.width, y: render.options.height - 20 },
      { x: render.options.width, y: render.options.height },
      { x: 0, y: render.options.height }
    ]);
  });
});
