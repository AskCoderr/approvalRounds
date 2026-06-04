const container = document.querySelector('.container');
const overlay = document.querySelector('.overlay');
const workspaceEditMenu = document.querySelector('.workspace-edit-menu');
const closeFormss = document.querySelectorAll('.close-forms');
const addWorkspaceButton = document.querySelector('.add-workspace-button');
const addWorkspaceModal = document.querySelector('.add-workspace-modal');

container.addEventListener('click', (event) => {
    if (event.target.matches('.edit-btn, .edit-icon')) {
        overlay.style.display = 'block';
        workspaceEditMenu.style.display = 'block';
    } else if (event.target.matches('.add-workspace-button')) {
        overlay.style.display = 'block';
    }
});

addWorkspaceButton.addEventListener('click', (event) => {
    overlay.style.display = 'block';
    addWorkspaceModal.style.display = 'block';  
});

closeFormss.forEach(closeForms => {
    closeForms.addEventListener('click', (event) => {
        workspaceEditMenu.style.display = 'none';
        overlay.style.display = 'none';
        addWorkspaceModal.style.display = 'none';
    });
});

overlay.addEventListener('click', (event) => {
    workspaceEditMenu.style.display = 'none';
    overlay.style.display = 'none';
    addWorkspaceModal.style.display = 'none';
});