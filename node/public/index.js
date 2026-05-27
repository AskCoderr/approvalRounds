const container = document.querySelector('.container');
const overlay = document.querySelector('.overlay');
const workspaceEditMenu = document.querySelector('.workspace-edit-menu');
const closeForms = document.querySelector('.close-forms');
const addWorkspaceButton = document.querySelector('.add-workspace-button');

container.addEventListener('click', (event) => {
    if (event.target.matches('.edit-btn, .edit-icon')) {
        overlay.style.display = 'block';
        workspaceEditMenu.style.display = 'block';
    } else if (event.target.matches('.add-workspace-button')) {
        overlay.style.display = 'block';
    }
});

closeForms.addEventListener('click', (event) => {
    workspaceEditMenu.style.display = 'none';
    overlay.style.display = 'none';
});

overlay.addEventListener('click', (event) => {
    workspaceEditMenu.style.display = 'none';
    overlay.style.display = 'none';
});