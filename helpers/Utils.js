function diffHours(date1, date2) {
  const diff = Math.abs(date1 - date2);
  return Math.floor(diff / 36e5);
}

function getRemainingTime(nextDate) {
  const now = new Date();
  const ms = nextDate - now;
  const hours = Math.floor(ms / 1000 / 60 / 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  return `${hours}h ${minutes}m`;
}

module.exports = { diffHours, getRemainingTime };
