let treeData = [];
const container = document.getElementById("tree-container");
const popup = document.getElementById("popup");
const form = document.getElementById("node-form");
const addBtn = document.getElementById("add-option-btn");

async function fetchTree() {
    const res = await fetch("/get_tree");
    const data = await res.json();
    treeData = data.tree;
    renderTree();
}

function renderTree() {
    container.innerHTML = "";
    const questions = ["Gender", "Version", "Year", "Section"];
    questions.forEach(q => {
        const row = document.createElement("div");
        row.className = "question-row";
        const title = document.createElement("h3");
        title.innerText = q;
        row.appendChild(title);

        treeData.filter(n => n.question === q).forEach(n => {
            const node = document.createElement("div");
            node.className = "node";
            node.innerText = n.label;
            node.onclick = () => editNode(n);
            row.appendChild(node);
        });

        container.appendChild(row);
    });
}

function editNode(node) {
    popup.classList.remove("hidden");
    document.getElementById("question").value = node.question;
    document.getElementById("label").value = node.label;
    document.getElementById("role_id").value = node.role_id || "";
    document.getElementById("node_id").value = node.id;
}

addBtn.onclick = () => {
    popup.classList.remove("hidden");
    document.getElementById("question").value = "";
    document.getElementById("label").value = "";
    document.getElementById("role_id").value = "";
    document.getElementById("node_id").value = "";
};

document.getElementById("cancel-btn").onclick = () => {
    popup.classList.add("hidden");
};

form.onsubmit = async (e) => {
    e.preventDefault();
    const node_id = document.getElementById("node_id").value;
    const label = document.getElementById("label").value;
    const question = document.getElementById("question").value;
    const role_id = document.getElementById("role_id").value;

    if (node_id) {
        await fetch("/update_node", {
            method: "POST",
            body: new URLSearchParams({ node_id, label, role_id })
        });
    } else {
        await fetch("/add_node", {
            method: "POST",
            body: new URLSearchParams({ label, question, role_id })
        });
    }

    popup.classList.add("hidden");
    fetchTree();
};

fetchTree();
