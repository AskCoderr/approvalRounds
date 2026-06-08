const usersLink = document.querySelector('.users-link');
const container = document.querySelector('.container');
const overlay = document.querySelector('.overlay');
const roleEditor = document.querySelector('.role-editor');
const addUserButton = document.querySelector('.add-user-button');
const closeFormss = document.querySelectorAll('.close-forms');
const roleEditorHeading = document.querySelector('.role-editor-heading');
const addUsersModal = document.querySelector('.add-users-modal');
const saveButton = document.querySelector('.save-button');

let popover, userData;

usersLink.classList.add('active');

container.addEventListener('click', (event) => {
    if (event.target.matches('.add-user-button')) {
        overlay.style.display = 'block';
        addUsersModal.style.display = 'block';
    } else if (event.target.closest('.remove')) {
        popover = bootstrap.Popover.getInstance(event.target.closest('.remove'));
        if (!popover) {
            popover = new bootstrap.Popover(event.target.closest('.remove'), {
                title: 'Are You Sure?',
                sanitize: false,
                html: true,
                content:  ` <div class="btn-group" role="group" aria-label="Basic mixed styles example">
                                <button type="button" class="btn btn-warning confirm-remove" data-user-id="${JSON.parse(event.target.closest('.items').dataset.userData).id}">Yes</button>
                                <button type="button" class="btn btn-info reject-cancel-btn">No</button>
                            </div>`,
                trigger: 'focus'                
            });
            popover.show();
        }
    } else if (event.target.matches('.edit-role')) {
        document.querySelectorAll('input[type="checkbox"]').forEach(checkBox => {
            checkBox.checked = false;
        });
        overlay.style.display = 'block';
        roleEditor.style.display = 'block';
        userData = JSON.parse(event.target.closest('li').dataset.userData);
        roleEditor.dataset.userId = userData.id;
        roleEditorHeading.textContent = userData.userName;
        userData.roles.forEach(role => {
            document.querySelector(`#${role}`).checked = true;
        });
    } else if (event.target.matches('.details')) {
        popover = bootstrap.Popover.getInstance(event.target);
        if (!popover) {
            userData = JSON.parse(event.target.closest('li').dataset.userData);
            popover = new bootstrap.Popover(event.target, {
                title: `${userData.userName}`,
                sanitize: false,
                html: true,
                content:  ` ${userData.email} `,
                trigger: 'focus'                
            });
            popover.show();
        }
    }
});
closeFormss.forEach(closeForms => {
    closeForms.addEventListener('click', (event) => {
        overlay.style.display = 'none';
        roleEditor.style.display = 'none';
        addUsersModal.style.display = 'none';
    });
});

overlay.addEventListener('click', (event) => {
    overlay.style.display = 'none';
    roleEditor.style.display = 'none';
    addUsersModal.style.display = 'none';
});

document.addEventListener('click', async (event) => {
    if (event.target.matches('.confirm-remove')) {
        try {
            await axios.delete(`/workspace/${container.dataset.workspaceId}/users/${event.target.dataset.userId}`);
            window.location.reload();
        } catch (error) {
            console.error(error);
        } 
    }
});

saveButton.addEventListener('click', async (event) => {
    const checkedRoles = [];
    document.querySelectorAll('.roles-container input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            checkedRoles.push(checkbox.id);
        }
    });
    try {
        await axios.post(`/workspace/${container.dataset.workspaceId}/users/${roleEditor.dataset.userId}/roles`, {
            roles: checkedRoles
        });
        window.location.reload();
    } catch (error) {
        console.error(error);
    }
});