const treeContainer = document.getElementById("tree-container");
const nodeLabelInput = document.getElementById("node-label");
const parentSelect = document.getElementById("parent-select");
const addBtn = document.getElementById("add-node-btn");

async function fetchTree() {
    const res = await fetch("/get_tree");
    const data = await res.json();
    renderTree(data.tree);
    updateParentOptions(data.tree);
}

function renderTree(nodes) {
    treeContainer.innerHTML = "";
    const rootNodes = nodes.filter(n => !n.parent_id);
    rootNodes.forEach(n => renderNode(n, nodes, treeContainer));
}

function renderNode(node, allNodes, container) {
    const div = document.createElement("div");
    div.className = "node";
    div.textContent = node.label;
    container.appendChild(div);

    const children = allNodes.filter(n => n.parent_id === node.id);
    if (children.length) {
        const childContainer = document.createElement("div");
        childContainer.style.marginLeft = "20px";
        container.appendChild(childContainer);
        children.forEach(c => renderNode(c, allNodes, childContainer));
    }
}

function updateParentOptions(nodes) {
    parentSelect.innerHTML = `<option value="">-- Parent Node (optional) --</option>`;
    nodes.forEach(n => {
        const opt = document.createElement("option");
        opt.value = n.id;
        opt.textContent = n.label;
        parentSelect.appendChild(opt);
    });
}

addBtn.addEventListener("click", async () => {
    const label = nodeLabelInput.value.trim();
    const parent_id = parentSelect.value || null;
    if (!label) return alert("Enter node label");

    await fetch("/add_node", {
        method: "POST",
        body: new URLSearchParams({ label, parent_id }),
    });

    nodeLabelInput.value = "";
    fetchTree();
});

fetchTree();
