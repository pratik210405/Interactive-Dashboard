const salesData = [
    { month: "January", category: "Electronics", orders: 42, customers: 35, revenue: 8400 },
    { month: "January", category: "Fashion", orders: 30, customers: 25, revenue: 4200 },
    { month: "February", category: "Electronics", orders: 48, customers: 39, revenue: 9600 },
    { month: "February", category: "Fashion", orders: 56, customers: 46, revenue: 5600 },
    { month: "March", category: "Home", orders: 38, customers: 32, revenue: 5100 },
    { month: "March", category: "Fashion", orders: 63, customers: 52, revenue: 6900 },
    { month: "April", category: "Electronics", orders: 51, customers: 43, revenue: 11200 },
    { month: "April", category: "Home", orders: 44, customers: 37, revenue: 6100 },
    { month: "May", category: "Fashion", orders: 70, customers: 58, revenue: 7900 },
    { month: "May", category: "Electronics", orders: 57, customers: 48, revenue: 12400 },
    { month: "June", category: "Home", orders: 49, customers: 41, revenue: 6800 },
    { month: "June", category: "Fashion", orders: 75, customers: 62, revenue: 8500 }
];

let monthlyChart;
let categoryChart;

const formatMoney = amount =>
    "$" + amount.toLocaleString("en-US");

function setupCategories() {
    const select = document.getElementById("categoryFilter");

    [...new Set(salesData.map(item => item.category))]
        .sort()
        .forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
}

function getFilteredData() {
    const search = document
        .getElementById("searchInput")
        .value.trim().toLowerCase();

    const category =
        document.getElementById("categoryFilter").value;

    const sort =
        document.getElementById("sortFilter").value;

    let records = salesData.filter(item => {
        const matchesSearch =
            item.month.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search);

        const matchesCategory =
            category === "all" || item.category === category;

        return matchesSearch && matchesCategory;
    });

    if (sort === "high") {
        records.sort((a, b) => b.revenue - a.revenue);
    }

    if (sort === "low") {
        records.sort((a, b) => a.revenue - b.revenue);
    }

    return records;
}

function updateDashboard() {
    const records = getFilteredData();

    const totalRevenue = records.reduce(
        (sum, item) => sum + item.revenue, 0
    );

    const totalOrders = records.reduce(
        (sum, item) => sum + item.orders, 0
    );

    const totalCustomers = records.reduce(
        (sum, item) => sum + item.customers, 0
    );

    const categoryRevenue = {};

    records.forEach(item => {
        categoryRevenue[item.category] =
            (categoryRevenue[item.category] || 0) + item.revenue;
    });

    const topCategory = Object.entries(categoryRevenue)
        .sort((a, b) => b[1] - a[1])[0];

    document.getElementById("totalRevenue").textContent =
        formatMoney(totalRevenue);

    document.getElementById("totalOrders").textContent =
        totalOrders.toLocaleString();

    document.getElementById("totalCustomers").textContent =
        totalCustomers.toLocaleString();

    document.getElementById("topCategory").textContent =
        topCategory ? topCategory[0] : "-";

    document.getElementById("recordCount").textContent =
        `Showing ${records.length} of ${salesData.length} records`;

    const table = document.getElementById("salesTable");
    table.replaceChildren();

    records.forEach(item => {
        const row = document.createElement("tr");

        [
            item.month,
            item.category,
            item.orders,
            item.customers,
            formatMoney(item.revenue)
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        table.appendChild(row);
    });

    document.getElementById("emptyMessage").hidden =
        records.length !== 0;

    updateCharts(records);
}

function updateCharts(records) {
    if (typeof Chart === "undefined") {
        console.error("Chart.js did not load. Check your internet connection.");
        return;
    }

    const months = [
        ...new Set(salesData.map(item => item.month))
    ];

    const monthlyValues = months.map(month =>
        records
            .filter(item => item.month === month)
            .reduce((sum, item) => sum + item.revenue, 0)
    );

    const categories = [
        ...new Set(records.map(item => item.category))
    ];

    const categoryValues = categories.map(category =>
        records
            .filter(item => item.category === category)
            .reduce((sum, item) => sum + item.revenue, 0)
    );

    const dark = document.body.classList.contains("dark");
    const textColor = dark ? "#b4bdcc" : "#737b91";

    if (monthlyChart) monthlyChart.destroy();
    if (categoryChart) categoryChart.destroy();

    monthlyChart = new Chart(
        document.getElementById("monthlyChart"),
        {
            type: "line",
            data: {
                labels: months,
                datasets: [{
                    label: "Revenue",
                    data: monthlyValues,
                    borderColor: "#6658e8",
                    backgroundColor: "rgba(102, 88, 232, 0.15)",
                    fill: true,
                    tension: 0.35
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: textColor } },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor,
                            callback: value => "$" + value.toLocaleString()
                        }
                    }
                }
            }
        }
    );

    categoryChart = new Chart(
        document.getElementById("categoryChart"),
        {
            type: "doughnut",
            data: {
                labels: categories,
                datasets: [{
                    data: categoryValues,
                    backgroundColor: [
                        "#6658e8",
                        "#20b8a6",
                        "#f5a623",
                        "#ef6484"
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: textColor }
                    }
                },
                cutout: "60%"
            }
        }
    );
}

document.getElementById("searchInput")
    .addEventListener("input", updateDashboard);

document.getElementById("categoryFilter")
    .addEventListener("change", updateDashboard);

document.getElementById("sortFilter")
    .addEventListener("change", updateDashboard);

document.getElementById("resetButton")
    .addEventListener("click", () => {
        document.getElementById("searchInput").value = "";
        document.getElementById("categoryFilter").value = "all";
        document.getElementById("sortFilter").value = "default";
        updateDashboard();
    });

document.getElementById("themeButton")
    .addEventListener("click", () => {
        document.body.classList.toggle("dark");

        const isDark =
            document.body.classList.contains("dark");

        document.getElementById("themeButton").textContent =
            isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

        updateDashboard();
    });

setupCategories();
updateDashboard();
