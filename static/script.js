let treeData = [];

// Fetch tree from backend
async function loadTree() {
    const res = await fetch("/get_tree");
    const data = await res.json();
    treeData = data.tree;
    renderTree();
    populateParentSelect();
}

// Render tree recursively
function renderTree() {
    const container = document.getElementById("tree");
    container.innerHTML = "";
    const topNodes = treeData.filter(n => !n.parent_id);
    topNodes.forEach(node => {
        container.appendChild(renderNode(node));
    });
}

function renderNode(node) {
    const div = document.createElement("div");
    div.className = "node";
    div.textContent = node.label;

    // Add edit form
    const form = document.createElement("div");
    form.className = "node-form";

    const input = document.createElement("input");
    input.value = node.label;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.onclick = async () => {
        await fetch("/update_node", {
            method: "POST",
            body: new URLSearchParams({
                node_id: node.id,
                label: input.value
            })
        });
        node.label = input.value;
        renderTree();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
        await fetch("/delete_node", {
            method: "POST",
            body: new URLSearchParams({
                node_id: node.id
            })
        });
        treeData = treeData.filter(n => n.id !== node.id);
        renderTree();
    };

    form.appendChild(input);
    form.appendChild(saveBtn);
    form.appendChild(deleteBtn);
    div.appendChild(form);

    // Render children
    const children = treeData.filter(n => n.parent_id === node.id);
    if (children.length) {
        const childContainer = document.createElement("div");
        childContainer.style.marginLeft = "20px";
        children.forEach(c => childContainer.appendChild(renderNode(c)));
        div.appendChild(childContainer);
    }

    return div;
}

// Populate parent select dropdown
function populateParentSelect() {
    const select = document.getElementById("parent-node-select");
    select.innerHTML = '<option value="">-- No parent (top-level) --</option>';
    treeData.forEach(node => {
        const opt = document.createElement("option");
        opt.value = node.id;
        opt.textContent = node.label;
        select.appendChild(opt);
    });
}

// Add new node
document.getElementById("add-node-btn").addEventListener("click", async () => {
    const label = document.getElementById("new-node-label").value;
    const parent_id = document.getElementById("parent-node-select").value || null;

    if (!label) return alert("Enter node label");

    await fetch("/add_node", {
        method: "POST",
        body: new URLSearchParams({
            label: label,
            parent_id: parent_id
        })
    });

    document.getElementById("new-node-label").value = "";
    await loadTree();
});

// Initial load
loadTree();
