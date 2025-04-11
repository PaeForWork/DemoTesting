function calculateTotal() {
  const free = parseFloat(document.getElementById("freeCredit").value) || 0;
  const pkg = parseFloat(document.getElementById("packageCredit").value) || 0;
  const topup = parseFloat(document.getElementById("topUpCredit").value) || 0;
  const total = free + pkg + topup;
  document.getElementById("remainingCredit").value = total.toFixed(2);
}
