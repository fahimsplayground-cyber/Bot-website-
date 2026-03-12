document.addEventListener("DOMContentLoaded", () => {
    const treeContainer = document.getElementById("tree-container");
    const popup = document.getElementById("popup");
    const nodeForm = document.getElementById("node-form");
    const addBtn = document.getElementById("add-option-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    let treeData = [];
    let editingNodeId = null;
    let parentId = null;

    async function fetchTree() {
        const res = await fetch("/get_tree");
        const data = await res.json();
        treeData = data.tree || [];
        renderTree();
    }

    function renderTree() {
        treeContainer.innerHTML = "";
        const roots = treeData.filter(n => !n.parent_id);
        roots.forEach(n => renderNode(n, treeContainer));
    }

    function renderNode(node, container) {
        const div = document.createElement("div");
        div.className = "option";
        div.textContent = node.label;
        div.onclick = () => openPopup(node);
        container.appendChild(div);

        const children = treeData.filter(n => n.parent_id === node.id);
        if (children.length) {
            const childContainer = document.createElement("div");
            childContainer.style.marginLeft = "20px";
            children.forEach(c => renderNode(c, childContainer));
            container.appendChild(childContainer);
        }
    }

    function openPopup(node = null) {
        popup.classList.remove("hidden");
        if (node) {
            document.getElementById("question").value = node.question;
            document.getElementById("label").value = node.label;
            document.getElementById("role_id").value = node.role_id || "";
            document.getElementById("node_id").value = node.id;
            document.getElementById("parent_id").value = node.parent_id || "";
        } else {
            nodeForm.reset();
            document.getElementById("node_id").value = "";
            document.getElementById("parent_id").value = "";
        }
    }

    addBtn.onclick = () => openPopup();

    cancelBtn.onclick = () => popup.classList.add("hidden");

    nodeForm.onsubmit = async (e) => {
        e.preventDefault();
        const node_id = document.getElementById("node_id").value;
        const question = document.getElementById("question").value;
        const label = document.getElementById("label").value;
        const role_id = document.getElementById("role_id").value;
        const parent_id = document.getElementById("parent_id").value || null;

        if (node_id) {
            await fetch("/update_node", {
                method: "POST",
                body: new URLSearchParams({ node_id, label, role_id })
            });
        } else {
            await fetch("/add_node", {
                method: "POST",
                body: new URLSearchParams({ question, label, role_id, parent_id })
            });
        }

        popup.classList.add("hidden");
        fetchTree();
    };

    fetchTree();
});
