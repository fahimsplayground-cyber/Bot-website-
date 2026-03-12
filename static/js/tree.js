const treeContainer = document.getElementById("tree");
const nodeModal = document.getElementById("nodeModal");
const closeModal = document.querySelector(".close");
const nodeForm = document.getElementById("nodeForm");
const nodeIdInput = document.getElementById("nodeId");
const parentIdInput = document.getElementById("parentId");
const labelInput = document.getElementById("label");
const addRootBtn = document.getElementById("addRootBtn");

let TREE = [];

async function fetchTree() {
    const res = await fetch("/get_tree");
    const data = await res.json();
    TREE = data.tree;
    renderTree();
}

function renderTree() {
    treeContainer.innerHTML = "";
    const rootNodes = TREE.filter(n => !n.parent_id);
    rootNodes.forEach(n => renderNode(n, treeContainer));
}

function renderNode(node, container) {
    const div = document.createElement("div");
    div.className = "node-card";
    div.textContent = node.label;

    const buttons = document.createElement("div");
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => openModal(node);
    buttons.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete";
    deleteBtn.onclick = () => deleteNode(node.id);
    buttons.appendChild(deleteBtn);

    div.appendChild(buttons);
    container.appendChild(div);

    const children = TREE.filter(n => n.parent_id === node.id);
    if(children.length > 0){
        const childContainer = document.createElement("div");
        childContainer.style.marginLeft = "20px";
        children.forEach(c => renderNode(c, childContainer));
        container.appendChild(childContainer);
    }
}

function openModal(node=null, parentId=null) {
    nodeModal.style.display = "flex";
    if(node){
        nodeIdInput.value = node.id;
        labelInput.value = node.label;
    } else {
        nodeIdInput.value = "";
        labelInput.value = "";
    }
    parentIdInput.value = parentId || "";
}

closeModal.onclick = () => nodeModal.style.display = "none";

nodeForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = nodeIdInput.value;
    const label = labelInput.value;
    const parent_id = parentIdInput.value || null;

    if(id){
        await fetch("/update_node", {
            method: "POST",
            body: new URLSearchParams({node_id: id, label})
        });
    } else {
        await fetch("/add_node", {
            method: "POST",
            body: new URLSearchParams({label, parent_id})
        });
    }

    nodeModal.style.display = "none";
    fetchTree();
}

async function deleteNode(id){
    await fetch("/delete_node", {
        method: "POST",
        body: new URLSearchParams({node_id: id})
    });
    fetchTree();
}

addRootBtn.onclick = () => openModal();
fetchTree();
