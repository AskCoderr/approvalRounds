const container = document.querySelector('.container');
const overlay = document.querySelector('.overlay');
const workspaceEditMenu = document.querySelector('.workspace-edit-menu');
const closeFormss = document.querySelectorAll('.close-forms');
const addWorkspaceButton = document.querySelector('.add-workspace-button');
const addWorkspaceModal = document.querySelector('.add-workspace-modal');
const createWorkspaceForm = document.querySelector('.create-workspace-form');
const updateWorkspaceNameForm = document.querySelector('.update-workspace-name-form');
const deleteWorkspaceForm = document.querySelector('.delete-workspace-form');

let workspaceClicked;
container.addEventListener('click', (event) => {
    if (event.target.matches('.edit-btn, .edit-icon')) {
        workspaceClicked = event.target.closest('.items').dataset.workspaceId;
        overlay.style.display = 'block';
        workspaceEditMenu.style.display = 'block';
    } else if (event.target.matches('.add-workspace-button')) {
        overlay.style.display = 'block';
    } else if (event.target.closest('.items')) {
        window.location.href = `/workspace/${event.target.closest('.items').dataset.workspaceId}/pending-approvals`;
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

createWorkspaceForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(createWorkspaceForm);

    try {
        await axios.post('/create-workspace', {
            workspaceName: formData.get('workspaceName'),
            members: formData.get('members')
        })
        window.location.reload();
    } catch (error) {
        console.error(error);
    }

});

updateWorkspaceNameForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(updateWorkspaceNameForm);
    try {
        await axios.patch(`/workspace/${workspaceClicked}/name/${formData.get('updateName')}`);
        window.location.reload();
    } catch (error) {
        console.error(error);
    }
});

deleteWorkspaceForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(deleteWorkspaceForm);
    if (formData.get('deleteInput') === 'delete') {
        try {
            await axios.delete(`/workspace/${workspaceClicked}`);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    }
});

