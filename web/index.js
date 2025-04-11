// Constants for credit rules
const CREDIT_RULES = {
  topup: {
    expiryDays: 1 // Top-up credits expire after 1 day
  }
};

function createCreditObject(type, amount, expiry, used = 0) {
  return {
    type,
    amount,
    expiry,
    used,
    getExpiryDate: function() {
      if (this.type === 'free') return null;
      return this.expiry;
    },
    isExpired: function(date) {
      const expiryDate = this.getExpiryDate();
      return expiryDate !== null && date > expiryDate;
    },
    getAvailableAmount: function(date) {
      if (this.isExpired(date)) return 0;
      return this.amount - this.used;
    }
  };
}

function calculateCreditUsage(credits, usageAmount, currentDate) {
  let remainingUsage = usageAmount;
  const usageBreakdown = [];

  // Sort credits by priority (free first, then by nearest expiry date)
  const sortedCredits = [...credits].sort((a, b) => {
    // Free credits always come first
    if (a.type === 'free') return -1;
    if (b.type === 'free') return 1;

    // Get expiry dates for comparison
    const aExpiry = a.getExpiryDate();
    const bExpiry = b.getExpiryDate();

    // If either is expired, expired one comes last
    if (a.isExpired(currentDate) && !b.isExpired(currentDate)) return 1;
    if (!a.isExpired(currentDate) && b.isExpired(currentDate)) return -1;
    if (a.isExpired(currentDate) && b.isExpired(currentDate)) return 0;

    // Sort by nearest expiry date
    return aExpiry - bExpiry;
  });

  for (const credit of sortedCredits) {
    if (remainingUsage <= 0) break;

    // Get available amount (will be 0 if expired)
    const available = credit.getAvailableAmount(currentDate);
    
    if (available <= 0) {
      usageBreakdown.push({
        type: credit.type,
        amount: 0,
        message: `${credit.type} credit expired (value set to 0)`
      });
      continue;
    }

    const deduction = Math.min(available, remainingUsage);
    
    if (deduction > 0) {
      credit.used += deduction;
      remainingUsage -= deduction;
      const expiryDate = credit.getExpiryDate();
      const expiryInfo = expiryDate ? ` (expires ${expiryDate.toLocaleString()})` : '';
      usageBreakdown.push({
        type: credit.type,
        amount: deduction,
        message: `Used ${deduction.toFixed(2)} from ${credit.type} credit${expiryInfo}`
      });
    }
  }

  return {
    remainingUsage,
    usageBreakdown,
    remainingTotal: credits.reduce((total, credit) => total + credit.getAvailableAmount(currentDate), 0)
  };
}

function calculateTotal() {
  // Get input values
  const freeCredit = parseFloat(document.getElementById("freeCredit").value) || 0;
  const packageCredit = parseFloat(document.getElementById("packageCredit").value) || 0;
  const topUpCredit = parseFloat(document.getElementById("topUpCredit").value) || 0;
  const usageAmount = parseFloat(document.getElementById("usageAmount").value) || 0;

  // Get expiry dates
  const packageExpiry = new Date(document.getElementById("packageExpiry").value);
  const topUpExpiry = new Date(document.getElementById("topUpExpiry").value);
  const currentDate = new Date();

  // Create credit objects
  const credits = [
    createCreditObject('free', freeCredit, null),
    createCreditObject('package', packageCredit, packageExpiry),
    createCreditObject('topup', topUpCredit, topUpExpiry)
  ];

  // Calculate credit usage
  const result = calculateCreditUsage(credits, usageAmount, currentDate);

  // Update the UI
  document.getElementById("remainingCredit").value = result.remainingTotal.toFixed(2);

  // Display usage breakdown
  const breakdownDiv = document.getElementById("creditUsageBreakdown");
  breakdownDiv.innerHTML = result.usageBreakdown.map(item => 
    `<div class="usage-item">${item.message}</div>`
  ).join('');

  if (result.remainingUsage > 0) {
    breakdownDiv.innerHTML += `<div class="usage-item" style="border-left-color: #dc3545;">
      Warning: ${result.remainingUsage.toFixed(2)} could not be deducted (insufficient credit)
    </div>`;
  }
}

function testFutureScenario() {
  // Get input values
  const freeCredit = parseFloat(document.getElementById("freeCredit").value) || 0;
  const packageCredit = parseFloat(document.getElementById("packageCredit").value) || 0;
  const topUpCredit = parseFloat(document.getElementById("topUpCredit").value) || 0;
  const usageAmount = parseFloat(document.getElementById("usageAmount").value) || 0;
  const daysToAdd = parseInt(document.getElementById("daysToAdd").value) || 0;

  // Get expiry dates
  const packageExpiry = new Date(document.getElementById("packageExpiry").value);
  const topUpExpiry = new Date(document.getElementById("topUpExpiry").value);
  
  // Create future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysToAdd);

  // Create credit objects
  const credits = [
    createCreditObject('free', freeCredit, null),
    createCreditObject('package', packageCredit, packageExpiry),
    createCreditObject('topup', topUpCredit, topUpExpiry)
  ];

  // Calculate credit usage for future scenario
  const result = calculateCreditUsage(credits, usageAmount, futureDate);

  // Display future scenario results
  const resultsDiv = document.getElementById("futureScenarioResults");
  resultsDiv.innerHTML = `
    <div class="usage-item">
      <h4>Future Scenario (${daysToAdd} days later):</h4>
      <p>Date: ${futureDate.toLocaleString()}</p>
      <p>Remaining Total: ${result.remainingTotal.toFixed(2)}</p>
    </div>
    <div class="usage-item">
      <h4>Credit Status:</h4>
      ${credits.map(credit => {
        const expiryDate = credit.getExpiryDate();
        const expiryInfo = expiryDate ? ` (expires ${expiryDate.toLocaleString()})` : '';
        const availableAmount = credit.getAvailableAmount(futureDate);
        return `
          <p>${credit.type} credit: 
            ${credit.isExpired(futureDate) ? 'Expired' : 'Valid'}${expiryInfo}
            (${availableAmount} remaining)
          </p>
        `;
      }).join('')}
    </div>
    <div class="usage-item">
      <h4>Usage Breakdown:</h4>
      ${result.usageBreakdown.map(item => `<p>${item.message}</p>`).join('')}
    </div>
  `;

  if (result.remainingUsage > 0) {
    resultsDiv.innerHTML += `<div class="usage-item" style="border-left-color: #dc3545;">
      Warning: ${result.remainingUsage.toFixed(2)} could not be deducted (insufficient credit)
    </div>`;
  }
}
