import { getGoogleSheetsData } from "./utils";

let pollingIntervalId;

console.log('cargando ui.js');

async function loadPlayerData() {
  const sheetId = '1gOEwD7nhh9EIZ96z4sEEy-3neCom0XMasMRxJ8buS9s';
  const range = 'A1:B11';
  const credentials = {
    client_email: '440901229794-cdjfb5nj8gmng5jj0sris6fhre3feedu.apps.googleusercontent.com',
    private_key: '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',
  };

  const data = await getGoogleSheetsData(sheetId, range, credentials);

  if (data) {
    const team1Players = document.getElementById('team1-players');
    team1Players.innerHTML = '';

    data.forEach((row) => {
      const playerName = row[0];
      const listItem = document.createElement('li');
      listItem.textContent = playerName;

      team1Players.appendChild(listItem);
    });
  } else {
    console.error('Failed to load player data from Google Sheets');
  }
}

async function loadSubstitutionData() {
  const sheetId = '1gOEwD7nhh9EIZ96z4sEEy-3neCom0XMasMRxJ8buS9s';
  const range = 'C1:E11';
  const credentials = {
    client_email: '440901229794-cdjfb5nj8gmng5jj0sris6fhre3feedu.apps.googleusercontent.com',
    private_key: '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',
  };

  const data = await getGoogleSheetsData(sheetId, range, credentials);

  if (data) {
    const substitutionsList = document.getElementById('substitutions');
    substitutionsList.innerHTML = '';

    data.forEach((row) => {
      const playerIn = row[0];
      const playerOut = row[1];
      const time = row[2];
      const listItem = document.createElement('li');
      listItem.textContent = `${playerIn} replaced ${playerOut} at ${time}`;

      substitutionsList.appendChild(listItem);
    });
  } else {
    console.error('Failed to load substitution data from Google Sheets');
  }
}

async function pollGoogleSheetsData(interval) {
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
  }

  await loadPlayerData();
  await loadSubstitutionData();

  pollingIntervalId = setInterval(async () => {
    await loadPlayerData();
    await loadSubstitutionData();
  }, interval);
}

function updateFigmaDesign() {
  const data = {
    'player1-name': document.getElementById('team1-players').children[0].textContent,
    'player2-name': document.getElementById('team1-players').children[1].textContent,
  };

  parent.postMessage({ pluginMessage: { type: 'update-design', data } }, '*');
}

document.getElementById('update-design-btn').addEventListener('click', updateFigmaDesign);

let clockInterval;
let elapsedTime = 0;
let isClockRunning = false;
const clockDisplay = document.getElementById('clock-display');

function updateClockDisplay() {
  let minutes = Math.floor(elapsedTime / 60);
  let seconds = elapsedTime % 60;

  const extraTime = elapsedTime > 90 * 60 ? elapsedTime - 90 * 60 : elapsedTime > 45 * 60 ? elapsedTime - 45 * 60 : 0;

  if (elapsedTime > 45 * 60) {
    minutes -= 45;
  }

  clockDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  if (extraTime > 0) {
    const extraTimeDisplay = document.getElementById('extra-time-display');
    extraTimeDisplay.textContent = `+${Math.floor(extraTime / 60)}:${(extraTime % 60).toString().padStart(2, '0')}`;
  }
}

function startClock() {
  console.log('entrando en esta monda');
  if (!isClockRunning) {
    isClockRunning = true;
        clockInterval = setInterval(() => {
      elapsedTime++;
      updateClockDisplay();
    }, 1000);
  }
}

function stopClock() {
  console.log('deteniendo esta monda');
  if (isClockRunning) {
    isClockRunning = false;
    clearInterval(clockInterval);
  }
}

function resetClock() {
  console.log('reseteando esta monda');
  elapsedTime = 0;
  updateClockDisplay();
}

document.getElementById('start-clock-btn').addEventListener('click', startClock);
document.getElementById('stop-clock-btn').addEventListener('click', stopClock);
document.getElementById('reset-clock-btn').addEventListener('click', resetClock);

pollGoogleSheetsData(10000);