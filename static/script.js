async function loadTree() {
    const res = await fetch('/');
    const html = await res.text();
    document.getElementById('tree').innerHTML = html;
}

// Example function to add node
async function addNode(parent_id, name, role_id) {
    await fetch('/add_node', {
        method: 'POST',
        body: new URLSearchParams({ parent_id, name, role_id })
    });
    loadTree();
}

// Example function to edit node
async function editNode(node_id, name, role_id) {
    await fetch('/edit_node', {
        method: 'POST',
        body: new URLSearchParams({ node_id, name, role_id })
    });
    loadTree();
}

loadTree();
