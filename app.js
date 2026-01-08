// ===============================
// Chart references
// ===============================
let expenseChart;
let trendChart;

// ===============================
// Personal Finance Tracker App
// ===============================
class FinanceTracker {
  constructor() {
    this.transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    this.budgets = JSON.parse(localStorage.getItem("budgets")) || [];
    this.goals = JSON.parse(localStorage.getItem("goals")) || [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateDashboard();
    this.renderTransactions();
    this.renderBudgets();
    this.renderGoals();
    this.renderCharts();
    this.renderRecentTransactions();
  }

  // ===============================
  // Charts
  // ===============================
  renderCharts() {
    this.renderExpenseChart();
    this.renderTrendChart();
  }

  renderExpenseChart() {
    const ctx = document.getElementById("expenseChart");
    if (!ctx) return;
    ctx.previousElementSibling.style.display = "none";

    const expenses = this.transactions.filter(t => t.type === "expense");
    if (expenses.length === 0) return;

    const categoryTotals = {};
    expenses.forEach(t => {
      categoryTotals[t.category] =
        (categoryTotals[t.category] || 0) + t.amount;
    });

    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
          data: Object.values(categoryTotals),
          backgroundColor: [
            "#3498db",
            "#2ecc71",
            "#e74c3c",
            "#f1c40f",
            "#9b59b6",
            "#1abc9c"
          ]
        }]
      },
      options: {
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  }

  renderTrendChart() {
    const ctx = document.getElementById("trendChart");
    if (!ctx) return;
    ctx.previousElementSibling.style.display = "none";

    const monthlyData = {};
    this.transactions.forEach(t => {
      const month = t.date.slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      monthlyData[month][t.type] += t.amount;
    });

    const labels = Object.keys(monthlyData);
    if (labels.length === 0) return;

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Income",
            data: labels.map(m => monthlyData[m].income),
            borderColor: "#2ecc71",
            fill: false
          },
          {
            label: "Expenses",
            data: labels.map(m => monthlyData[m].expense),
            borderColor: "#e74c3c",
            fill: false
          }
        ]
      }
    });
  }

  // ===============================
  // Recent Transactions
  // ===============================
  renderRecentTransactions() {
    const container = document.getElementById("recentTransactionsList");
    if (!container) return;
    container.innerHTML = "";

    const recent = [...this.transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    if (recent.length === 0) {
      container.innerHTML = "<p>No recent transactions.</p>";
      return;
    }

    recent.forEach(t => {
      const div = document.createElement("div");
      div.innerHTML = `<div class="d-flex">
      <span class="col-6">${t.description}</span> 
      <span class="col-6 text-end">£${t.amount.toFixed(2)}</span>
      </div>`;
      container.appendChild(div);
    });
  }

  // ===============================
  // Event Listeners
  // ===============================
  setupEventListeners() {
    document.getElementById("transactionForm").addEventListener("submit", e => {
      e.preventDefault();
      this.addTransaction();
    });

    document.getElementById("budgetForm").addEventListener("submit", e => {
      e.preventDefault();
      this.addBudget();
    });

    document.getElementById("goalForm").addEventListener("submit", e => {
      e.preventDefault();
      this.addGoal();
    });

    document.getElementById("transactionDate").value =
      new Date().toISOString().split("T")[0];
  }

  // ===============================
  // Transactions
  // ===============================
  addTransaction() {
    const transaction = {
      id: Date.now(),
      type: transactionType.value,
      amount: parseFloat(transactionAmount.value),
      category: transactionCategory.value,
      description: transactionDescription.value,
      date: transactionDate.value
    };

    if (!transaction.description || transaction.amount <= 0) {
      alert("Enter valid transaction details");
      return;
    }

    this.transactions.push(transaction);
    this.saveData();
    this.updateDashboard();
    this.renderTransactions();
    this.renderCharts();
    this.renderRecentTransactions();
    this.closeModal("transactionModal");
    transactionForm.reset();
  }

  renderTransactions() {
    const list = document.getElementById("transactionsList");
    list.innerHTML = "";

    if (this.transactions.length === 0) {
      list.innerHTML = "<p>No transactions added yet.</p>";
      return;
    }

    this.transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(t => {
        const div = document.createElement("div");
        div.className = `transaction-item ${t.type}`;
        div.innerHTML = `
  <div class="col-6">
    <strong>${t.description}</strong>
  </div>
<div class="transaction-amount ${t.type} col-4">
  <span class="amount">
    ${t.type === "income" ? "+" : "-"}£${t.amount.toFixed(2)}
  </span>
  <span class="transaction-category text-capitalize">
    ${t.category}
  </span>
</div>

  <button class="btn btn-danger col-2 w-auto" onclick="app.deleteTransaction(${t.id})">
    Delete
  </button>
`;

        list.appendChild(div);
      });
  }

  deleteTransaction(id) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.saveData();
    this.updateDashboard();
    this.renderTransactions();
    this.renderCharts();
    this.renderRecentTransactions();
  }

  // ===============================
  // Dashboard
  // ===============================
  updateDashboard() {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const monthlyTransactions = this.transactions.filter(t =>
    t.date.startsWith(currentMonth)
  );

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyProfit = monthlyIncome - monthlyExpenses;

  const totalBalance = this.transactions.reduce(
    (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
    0
  );
   // ===============================
   // Last Month Summary
   // ===============================
  const now = new Date();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 7);

  const lastMonthTransactions = this.transactions.filter(t =>
  t.date.startsWith(lastMonth)
   );

const lastMonthIncome = lastMonthTransactions
  .filter(t => t.type === "income")
  .reduce((sum, t) => sum + t.amount, 0);

const lastMonthExpenses = lastMonthTransactions
  .filter(t => t.type === "expense")
  .reduce((sum, t) => sum + t.amount, 0);

document.getElementById("lastMonthIncome").textContent =
  `£${lastMonthIncome.toFixed(2)}`;

document.getElementById("lastMonthExpenses").textContent =
  `£${lastMonthExpenses.toFixed(2)}`;

  // Dashboard cards
  document.getElementById("totalBalance").textContent =
    `£${totalBalance.toFixed(2)}`;

  document.getElementById("monthlyIncome").textContent =
    `£${monthlyIncome.toFixed(2)}`;

  document.getElementById("monthlyExpenses").textContent =
    `£${monthlyExpenses.toFixed(2)}`;

  document.getElementById("monthlyProfit").textContent =
    `£${monthlyProfit.toFixed(2)}`;
}

  // ===============================
  // Budgets
  // ===============================
  addBudget() {
    const budget = {
      id: Date.now(),
      category: budgetCategory.value,
      amount: parseFloat(budgetAmount.value)
    };

    if (budget.amount <= 0) {
      alert("Enter valid budget");
      return;
    }

    this.budgets.push(budget);
    this.saveData();
    this.renderBudgets();
    this.closeModal("budgetModal");
    budgetForm.reset();
  }

  renderBudgets() {
    const list = document.getElementById("budgetList");
    list.innerHTML = "";

    if (this.budgets.length === 0) {
      list.innerHTML = "<p>No budgets added yet.</p>";
      return;
    }

    this.budgets.forEach(b => {
      const div = document.createElement("div");
      div.className = "budget-item";
      div.innerHTML = `
        <strong class="col-6 text-capitalize">${b.category}</strong>
        <span class="col-3">£${b.amount.toFixed(2)}</span>
        <button class="btn btn-danger col-3 w-auto" onclick="app.deleteBudget(${b.id})">Delete</button>
      `;
      list.appendChild(div);
    });
  }

  deleteBudget(id) {
    this.budgets = this.budgets.filter(b => b.id !== id);
    this.saveData();
    this.renderBudgets();
  }

  // ===============================
  // Goals
  // ===============================
  addGoal() {
    const goal = {
      id: Date.now(),
      name: goalName.value,
      target: parseFloat(goalTarget.value),
      current: parseFloat(goalCurrent.value)
    };

    if (!goal.name || goal.target <= 0) {
      alert("Enter valid goal");
      return;
    }

    this.goals.push(goal);
    this.saveData();
    this.renderGoals();
    this.closeModal("goalModal");
    goalForm.reset();
  }

  renderGoals() {
    const list = document.getElementById("goalsList");
    list.innerHTML = "";

    if (this.goals.length === 0) {
      list.innerHTML = "<p>No goals added yet.</p>";
      return;
    }

    this.goals.forEach(g => {
      const div = document.createElement("div");
      div.className = "goal-item";
      div.innerHTML = `
        <strong>${g.name}</strong>
        £${g.current.toFixed(2)} / £${g.target.toFixed(2)}
        <button class="btn btn-danger" onclick="app.deleteGoal(${g.id})">Delete</button>
      `;
      list.appendChild(div);
    });
  }

  deleteGoal(id) {
    this.goals = this.goals.filter(g => g.id !== id);
    this.saveData();
    this.renderGoals();
  }

  // ===============================
  // Storage & Modals
  // ===============================
  saveData() {
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
    localStorage.setItem("budgets", JSON.stringify(this.budgets));
    localStorage.setItem("goals", JSON.stringify(this.goals));
  }

  showModal(id) {
    document.getElementById(id).style.display = "block";
  }

  closeModal(id) {
    document.getElementById(id).style.display = "none";
  }
}

// ===============================
// Global Helpers
// ===============================
function switchTab(tab, event) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.getElementById(tab).classList.add("active");
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  event.currentTarget.classList.add("active");
}

function showAddTransactionModal() { app.showModal("transactionModal"); }
function showAddBudgetModal() { app.showModal("budgetModal"); }
function showAddGoalModal() { app.showModal("goalModal"); }
function closeModal(id) { app.closeModal(id); }

// ===============================
// Start App
// ===============================
window.onload = () => {
  window.app = new FinanceTracker();
};
