const api_url = "https://66f50e799aa4891f2a23af6e.mockapi.io/Money_Management_app";
let isEditing = false; 
let editId = null; 
let all_data=[];

async function getValue() {
    const description = document.getElementById("des");
    const amount = document.getElementById("amt");
    let selectedOption = document.querySelector('input[name="option"]:checked');

    if (description.value === "" || amount.value === "" || selectedOption === null) {
        alert("Please fill the form");
        return;
    }

    const new_data = {
        description: description.value,
        amount: amount.value,
        type: selectedOption.value
    }

    if (isEditing && editId) {
        try {
            const req = await fetch(`${api_url}/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(new_data)
            });

            if (req.ok) {
                alert("Data updated successfully!");
                resetForm();
                retrieveData(); 
            } else {
                alert("Failed to update data. Please try again.");
            }
        } catch (error) {
            console.error("Error updating data:", error);
            alert("An error occurred while updating data.");
        }
    } else {
        try {
            const req = await fetch(api_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(new_data)
            });

            if (req.ok) {
                alert("Data submitted successfully!");
                resetForm(); 
                retrieveData(); 
            } else {
                alert("Failed to submit data. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            alert("An error occurred. Please try again later.");
        }
    }
}

function filterData(type) {
    let filteredData = all_data;

    if (type === "Income") {
        filteredData = all_data.filter(item => item.type === "Income");
    } else if (type === "Expense") {
        filteredData = all_data.filter(item => item.type === "Expense");
    } else if (type === "All") {
        filteredData = all_data;
    }

    displayData(filteredData); 
    calculateTotals(filteredData); 
}

async function retrieveData() {
    try {
        const req = await fetch(api_url);
        if (req.ok) {
            all_data = await req.json(); // Store fetched data in all_data
            displayData(all_data);
            calculateTotals(all_data);
        } else {
            alert(`Failed to retrieve data. Status: ${req.status} ${req.statusText}`);
        }
    } catch (error) {
        console.error("Error retrieving data:", error);
        alert("An error occurred while retrieving data: " + error.message);
    }
}

function calculateTotals(data) {
    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach(item => {
        if (item.type === "Income") {
            totalIncome += parseFloat(item.amount);
        } else if (item.type === "Expense") {
            totalExpense += parseFloat(item.amount); 
        }
    });

    const balance = totalIncome - totalExpense;
    document.getElementById("income-total").innerText = `$${totalIncome.toFixed(2)}`;
    document.getElementById("expense-total").innerText = `$${totalExpense.toFixed(2)}`;
    document.getElementById("balance-total").innerText = `$${balance.toFixed(2)}`;
}

function displayData(data) {
    const data_container = document.getElementById("data-container");
    data_container.innerHTML = "";
    data.forEach(element => {
        const div_1 = document.createElement("div");
        div_1.className = "flex flex-col gap-5 bg-white p-5 rounded-lg shadow-lg shadow-black";
        data_container.append(div_1);

        const div_1_child_1 = document.createElement("div");
        div_1_child_1.className = "flex flex-col items-center justify-center gap-2";
        div_1.append(div_1_child_1);

        const des = document.createElement("div");
        des.className = "font-bold";
        des.innerText = element.description;
        div_1_child_1.append(des);

        const amt = document.createElement("div");
        amt.className = "font-bold px-1";
        amt.innerText = `$${element.amount}`;
        div_1_child_1.append(amt);

        const div_1_child_2 = document.createElement("div");
        div_1_child_2.className = "flex items-center justify-center gap-5";
        div_1.append(div_1_child_2);

        const btn_edit = document.createElement("button");
        btn_edit.className = "rounded-lg bg-blue-500 px-2 py-1 text-white font-sm font-bold";
        btn_edit.innerHTML = "Edit";
        btn_edit.onclick = () => editData(element); 
        div_1_child_2.append(btn_edit);

        const btn_del = document.createElement("button");
        btn_del.className = "rounded-lg bg-red-500 px-2 py-1 text-white font-sm font-bold";
        btn_del.innerHTML = "Delete";
        btn_del.onclick = () => deleteData(element.id);
        div_1_child_2.append(btn_del);
    });
}

async function deleteData(id) {
    try {
        const req = await fetch(`${api_url}/${id}`, { method: "DELETE" });

        if (req.ok) {
            alert("Data deleted successfully!");
            retrieveData(); 
        } else {
            alert("Failed to delete data.");
        }
    } catch (error) {
        console.error("Error deleting data:", error);
        alert("An error occurred while deleting data.");
    }
}

function editData(element) {
    const description = document.getElementById("des");
    const amount = document.getElementById("amt");
    const incomeRadio = document.getElementById("inc");
    const expenseRadio = document.getElementById("exp");

    description.value = element.description;
    amount.value = element.amount;
    if (element.type === "Income") {
        incomeRadio.checked = true;
    } else {
        expenseRadio.checked = true;
    }

    isEditing = true;
    editId = element.id; 

    
    const addButton = document.querySelector('button[onclick="getValue()"]');
    addButton.innerText = "Update";
}

function resetForm() {
    document.getElementById("des").value = "";
    document.getElementById("amt").value = "";
    document.querySelector('input[name="option"]:checked').checked = false;

    isEditing = false;
    editId = null;

    const addButton = document.querySelector('button[onclick="getValue()"]');
    addButton.innerText = "Add";
}

window.onload = () => {
    retrieveData();
    const filter_all=document.getElementById("filter-all");
    filter_all.addEventListener("click",()=>filterData("All"))
    const filter_income=document.getElementById("filter-income");
    filter_income.addEventListener("click",()=>filterData("Income"))
    const filter_expense=document.getElementById("filter-expense");
    filter_expense.addEventListener("click",()=>filterData("Expense"))
};
