const MAX_ENEMY = 9;

const score = document.querySelector('.score'),
    start = document.querySelector('.start'),
    gameArea = document.querySelector('.game-area'),
    car = document.createElement('div'),
    volume = document.querySelector('.volume'),
    difficultBtn = document.querySelectorAll('.difficult-box__item'),
    bestScore = document.querySelector('.best-score');

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowRight: false,
    ArrowLeft: false,
    w: false,
    s: false,
    d: false,
    a: false
};

const setting = {
    start: false,
    score: 0,
    speed: 3,
    traffic: 2.5,
    volume: true
};

// const music = document.createElement('embed');

// music.src = 'audio/audio.mp3';

// music.classList.add('visually-hidden');

const music = new Audio('background.mp3');
music.loop = true;

car.classList.add('car');
score.classList.add('hide');

start.addEventListener('click', startGame);
// Запуск по пробелу
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && setting.start === false) {
        startGame();
    }
});

document.addEventListener('keydown', startRun);
document.addEventListener('keyup', stopRun);

// Показ лучшего рекорда после перезагрузки
bestScore.innerHTML = `Best record<br>${showBestRecord()}`;

// Кнопка громкости
volume.addEventListener('click', toggleVolume);

// Уровень сложности
difficultBtn.forEach(button => {
    button.addEventListener('click', (e) => {
        difficultBtn.forEach(btn => {
            btn.classList.remove('difficult-box__item-active');
        });
        e.target.classList.add('difficult-box__item-active');
        setting.speed = +e.target.getAttribute('data-difficult');
        // if (setting.start === true) {
        //     setting.start = false;
        //     startGame();
        // }
    });
});


// Functions

// Вычисление кол-ва помещающихся объектов
function getQuantityElements(heightElem) {
    return Math.round(document.documentElement.clientHeight / heightElem + 1);
}

// Подстановка числа для рандомной картинки противника
const getRandomEnemy = (max) => Math.floor((Math.random() * max) + 1);

// Начало игры
function startGame() {

    bestScore.innerHTML = `Best record<br>${showBestRecord()}`;

    // document.body.append(music);

    // setTimeout(() => {
    //     music.remove();
    // }, 3000);

    music.play();

    start.classList.add('hide');
    score.classList.remove('hide');

    gameArea.innerHTML = '';


// Создание линий
    for (let i = 0; i < getQuantityElements(50); i++) {
        const line = document.createElement('div');
        line.classList.add('line');
        line.style.top = (i * 100) + 'px';
        line.y = i * 100;
        gameArea.appendChild(line);
    }

// Создание врагов
    for (let i = 0; i < getQuantityElements(100 * setting.traffic); i++) {
        const enemy = document.createElement('div');
        enemy.classList.add('enemy');

        enemy.y = -100 * setting.traffic * (i + 1);
        enemy.style.top = enemy.y + 'px';
        enemy.style.left = Math.floor((Math.random() * (gameArea.offsetWidth - 50))) + 'px';
        
        enemy.style.background = `
        transparent 
        url('images/enemy${getRandomEnemy(MAX_ENEMY)}.png')
        center / cover 
        no-repeat`;

        gameArea.appendChild(enemy);
    }

    setting.score = 0;
    setting.start = true;
    gameArea.appendChild(car);
    car.style.left = (gameArea.offsetWidth / 2) - (car.offsetWidth / 2) + 'px';
    car.style.bottom = '10px';
    car.style.top = '';
    setting.x = car.offsetLeft;
    setting.y = car.offsetTop;
    requestAnimationFrame(playGame);
}

function playGame() {
    if (setting.start) {
        setting.score += setting.speed;
        score.innerHTML = 'SCORE<br>' + setting.score;
        moveRoad();
        moveEnemy();
        if ((keys.ArrowLeft || keys.a) && setting.x > 0) {
            setting.x -= setting.speed;
        }

        if ((keys.ArrowRight || keys.d) && setting.x < (gameArea.offsetWidth - car.offsetWidth)) {
            setting.x += setting.speed;
        }

        if ((keys.ArrowDown || keys.s) && setting.y < (gameArea.offsetHeight - car.offsetHeight)) {
            setting.y += setting.speed;
        }

        if ((keys.ArrowUp || keys.w) && setting.y > 0) {
            setting.y -= setting.speed;
        }

        car.style.left = setting.x + 'px';
        car.style.top = setting.y + 'px';

        requestAnimationFrame(playGame);
    }
}

function startRun(e) {
    if (keys.hasOwnProperty(e.key)) {
        e.preventDefault();
        keys[e.key] = true;
    }
}

function stopRun(e) {
    if (keys.hasOwnProperty(e.key)) {
        e.preventDefault();
        keys[e.key] = false;
    }
}

function moveRoad() {
    const lines = document.querySelectorAll('.line');
    lines.forEach(line => {
        line.y += setting.speed;
        line.style.top = line.y + 'px';

        if (line.y >= document.documentElement.clientHeight) {
            line.y = -100;
        }
    });
}

function moveEnemy() {
    const enemy = document.querySelectorAll('.enemy');
    enemy.forEach(item => {
        let carRect = car.getBoundingClientRect();
        let enemyRect = item.getBoundingClientRect();

        if (carRect.top <= enemyRect.bottom &&
            carRect.right >= enemyRect.left &&
            carRect.left <= enemyRect.right &&
            carRect.bottom >= enemyRect.top) {
                setting.start = false;
                start.classList.remove('hide');
                start.style.top = gameArea.offsetHeight / 2 + 'px';
                start.innerHTML = 'Game over!<br>Click to try again!';
                music.pause();
                bestScore.innerHTML = `Best Record<br>${showBestRecord()}`;
                if (setting.score > showBestRecord()) {
                    localStorage.setItem('best', +setting.score);
                    start.innerHTML = 'Congratulations!<br>You have broken your record! <br> Click to try again!';
                    bestScore.innerHTML = `New record<br>${showBestRecord()}`;
                }

        }

        item.y += setting.speed * 1.5;
        item.style.top = item.y + 'px';

        if (item.y >= document.documentElement.clientHeight) {
            item.y = -100 * setting.traffic;
            item.style.left = Math.floor((Math.random() * (gameArea.offsetWidth - 50))) + 'px';
        }
    });
}

// Переключение громкости
function toggleVolume() {
    if (setting.volume === true) {
        music.muted = true;
        setting.volume = false;
        volume.style.background = `
        transparent
        url('./images/mute.svg') 
        center / cover 
        no-repeat
        `;
    } else {
        music.muted = false;
        setting.volume = true;
        volume.style.background = `
        transparent
        url('./images/volume.svg') 
        center / cover 
        no-repeat
        `;
    }
}

// Лучший рекорд

function showBestRecord() {
    if (localStorage.getItem('best')) {
        return localStorage.getItem('best');
    } else {
        localStorage.setItem('best', 0);
        return localStorage.getItem('best');
    }
}