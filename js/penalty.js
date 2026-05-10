/* ===== PENALTY SETTINGS MODULE ===== */

function loadPenaltySettings() {
  var p = getPenalty();
  document.getElementById('penaltyPerDay').value = p.perDay;
  document.getElementById('penaltyMax').value = p.max;
  document.getElementById('borrowDuration').value = p.duration;
}

function savePenaltySettings() {
  var perDay = parseFloat(document.getElementById('penaltyPerDay').value) || 0;
  var max = parseFloat(document.getElementById('penaltyMax').value) || 0;
  var duration = parseInt(document.getElementById('borrowDuration').value) || 7;
  setPenalty({ perDay: perDay, max: max, duration: duration });
  showToast('Penalty settings saved!');
}
