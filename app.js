// ===============================
// Personal Finance Tracker App
// ===============================

class FinanceTracker {
  constructor() {
    this.transactions =
      JSON.parse(localStorage.getItem("transactions")) || [];
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
  }

  // -------------------------------
  // Event Listeners
  // -------------------------------
  setupEventListeners() {
    document
      .getElementById("transactionForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.addTransaction();
      });

    document
      .getElementById("budgetForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.addBudget();
      });

    document.getElementById("goalForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.addGoal();
    });

    const today = new Date().toISOString().split("T")[0];
    document.getElementById("transactionDate").value = today;
  }

  // -------------------------------
  // Transactions
  // -------------------------------
  addTransaction() {
    const transaction = {
      id: Date.now(),
      type: document.getElementById("transactionType").value,
      amount: parseFloat(
        document.getElementById("transactionAmount").value
      ),
      category: document.getElementById("transactionCategory").value,
      description: document.getElementById("transactionDescription").value,
      date: document.getElementById("transactionDate").value,
    };
    // validation
    if (!transaction.description || isNaN(transaction.amount) || transaction.amount <= 0) {
  alert("Please enter a valid transaction description and amount.");
  return;
    }
 
    this.transactions.push(transaction);
    this.saveData();
    this.updateDashboard();
    this.renderTransactions();
    this.renderCharts();
    this.closeModal("transactionModal");
    document.getElementById("transactionForm").reset();
  }

  renderTransactions() {
    const list = document.getElementById("transactionsList");
    list.innerHTML = "";

    this.transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach((transaction) => {
        const div = document.createElement("div");
        div.className = `transaction-item ${transaction.type}`;

        div.innerHTML = `
          <div>
            <strong>${transaction.description}</strong><br/>
            <small>${transaction.date}</small>
          </div>
          <div class="transaction-amount ${transaction.type}">
            ${
              transaction.type === "income" ? "+" : "-"
            }£${transaction.amount.toFixed(2)}
          </div>
          <span class="transaction-category">${transaction.category}</span>
          <button class="btn btn-danger" onclick="app.deleteTransaction(${
            transaction.id
          })">Delete</button>
        `;

        list.appendChild(div);
      });
  }

  deleteTransaction(id) {
    this.transactions = this.transactions.filter((t) => t.id !== id);
    this.saveData();
    this.updateDashboard();
    this.renderTransactions();
    this.renderCharts();
  }

  // -------------------------------
  // Dashboard
  // -------------------------------
  updateDashboard() {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const monthlyTransactions = this.transactions.filter((t) =>
      t.date.startsWith(currentMonth)
    );

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = this.transactions.reduce(
      (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
      0
    );

    document.getElementById(
      "totalBalance"
    ).textContent = `£${totalBalance.toFixed(2)}`;

    document.getElementById(
      "monthlyIncome"
    ).textContent = `£${monthlyIncome.toFixed(2)}`;

    document.getElementById(
      "monthlyExpenses"
    ).textContent = `£${monthlyExpenses.toFixed(2)}`;
  }

  // -------------------------------
  // Budgets
  // -------------------------------
  addBudget() {
  const budget = {
    id: Date.now(),
    category: document.getElementById("budgetCategory").value,
    amount: parseFloat(document.getElementById("budgetAmount").value),
  };

  // Validation
  if (!budget.category || isNaN(budget.amount) || budget.amount <= 0) {
    alert("Please enter a valid budget category and amount.");
    return;
  }
  this.budgets.push(budget);
  this.saveData();
  this.renderBudgets();
  this.closeModal("budgetModal");
  document.getElementById("budgetForm").reset();
}   
    
  

  renderBudgets(){
    const list = document.getElementById("budgetList");
    list.innerHTML = "";

    this.budgets.forEach((budget) => {
      const div = document.createElement("div");
      div.className = "budget-item";
      div.innerHTML = `
        <strong>${budget.category}</strong>
        <span>£${budget.amount.toFixed(2)}</span>
        <button class="btn btn-danger" onclick="app.deleteBudget(${budget.id})">
          Delete
        </button>
      `;
      list.appendChild(div);
    });
  }

  deleteBudget(id) {
    this.budgets = this.budgets.filter((b) => b.id !== id);
    this.saveData();
    this.renderBudgets();
  }

  // -------------------------------
  // Goals
  // -------------------------------
  addGoal() {
    const goal = {
      id: Date.now(),
      name: document.getElementById("goalName").value,
      target: parseFloat(document.getElementById("goalTarget").value),
      current: parseFloat(document.getElementById("goalCurrent").value),
      targetDate: document.getElementById("goalDate").value,
    
    };
       // Validation
  if (!goal.name || isNaN(goal.target) || goal.target <= 0) {
    alert("Please enter a valid goal name and target amount.");
    return;
  }

    this.goals.push(goal);
    this.saveData();
    this.renderGoals();
    this.closeModal("goalModal");
    document.getElementById("goalForm").reset();
  }

  renderGoals() {
    const list = document.getElementById("goalsList");
    list.innerHTML = "";

    this.goals.forEach((goal) => {
      const div = document.createElement("div");
      div.className = "goal-item";
      div.innerHTML = `
        <strong>${goal.name}</strong>
        <div>£${goal.current.toFixed(2)} / £${goal.target.toFixed(2)}</div>
        <button class="btn btn-danger" onclick="app.deleteGoal(${goal.id})">
          Delete
        </button>
      `;
      list.appendChild(div);
    });
  }

  deleteGoal(id) {
    this.goals = this.goals.filter((g) => g.id !== id);
    this.saveData();
    this.renderGoals();
  }

  // -------------------------------
  // Charts
  // -------------------------------
  renderCharts() {
    // Charts optional – safe to leave empty for now
  }

  // -------------------------------
  // Storage
  // -------------------------------
  saveData() {
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
    localStorage.setItem("budgets", JSON.stringify(this.budgets));
    localStorage.setItem("goals", JSON.stringify(this.goals));
  }

  // -------------------------------
  // Modals
  // -------------------------------
  showModal(id) {
    document.getElementById(id).style.display = "block";
  }

  closeModal(id) {
    document.getElementById(id).style.display = "none";
  }
}

// Global helpers
function switchTab(tab) {
  document.querySelectorAll(".tab-content").forEach((el) => {
    el.classList.remove("active");
  });
  document.getElementById(tab).classList.add("active");
}

function showAddTransactionModal() {
  app.showModal("transactionModal");
}

function showAddBudgetModal() {
  app.showModal("budgetModal");
}

function showAddGoalModal() {
  app.showModal("goalModal");
}

function closeModal(id) {
  app.closeModal(id);
}

// Start app
const app = new FinanceTracker();
