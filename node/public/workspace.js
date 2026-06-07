const pendingApprovalLink = document.querySelector('.pending-approval-link');
const container = document.querySelector('.container');
const overlay = document.querySelector('.overlay');
const closeForms = document.querySelector('.close-forms');
const approvalBox = document.querySelector('.approval-box');

pendingApprovalLink.classList.add('active');

container.addEventListener('click', (event) => {
    const item = event.target.closest('.items');
    if (item) {
        
        overlay.style.display = 'block';
        approvalBox.style.display = 'block';
    }
});

closeForms.addEventListener('click', (event) => {
    approvalBox.style.display = 'none';
    overlay.style.display = 'none';
});

overlay.addEventListener('click', (event) => {
    approvalBox.style.display = 'none';
    overlay.style.display = 'none';
});


const reject = document.querySelector('.reject-btn');
const approve = document.querySelector('.approve-btn');
const rejectPopover = new bootstrap.Popover(reject, {
    title: 'Are You Sure?',
    sanitize: false,
    html: true,
    content:  ` <div class="btn-group" role="group" aria-label="Basic mixed styles example">
                    <button type="button" class="btn btn-warning">Confirm</button>
                    <button type="button" class="btn btn-info reject-cancel-btn">Cancel</button>
                </div>`
});

const approvePopover = new bootstrap.Popover(approve, {
    title: 'Are You Sure?',
    sanitize: false,
    html: true,
    content:  ` <div class="btn-group" role="group" aria-label="Basic mixed styles example">
                    <button type="button" class="btn btn-warning">Confirm</button>
                    <button type="button" class="btn btn-info approve-cancel-btn">Cancel</button>
                </div>`
});

document.addEventListener('click', (event) => {
    if (event.target.matches('.reject-cancel-btn')) {
        rejectPopover.hide();
    } else if (event.target.matches('.approve-cancel-btn')) {
        approvePopover.hide();
    }
});