const pendingApprovalLink = document.querySelector('.pending-approval-link');
const container = document.querySelector('.container');
const overlay = document.querySelector('.overlay');
const closeForms = document.querySelector('.close-forms');
const approvalBox = document.querySelector('.approval-box');
const approvalTitle = document.querySelector('.approval-title');
const subject = document.querySelector('.subject');
const initiatedBy = document.querySelector('.initiated-by');
const body = document.querySelector('.body');
const attachmentsContainer = document.querySelector('.attachments-container');
const commentsContainer = document.querySelector('.comments-container');
const postButton = document.querySelector('.post-button');
const userComment = document.querySelector('.user-comment');

pendingApprovalLink.classList.add('active');

let currentNodeId;

container.addEventListener('click', async (event) => {
    const item = event.target.closest('.items');
    if (item) {
        currentNodeId = item.dataset.nodeId;
        approvalBox.dataset.approvalId = item.dataset.approvalId;
        attachmentsContainer.innerHTML = "";
        commentsContainer.innerHTML = "";
        let response;
        try {
            response = await axios.get(`/workspace/${container.dataset.workspaceId}/pending-approvals/${item.dataset.approvalId}`);
            approvalTitle.textContent = response.data.title;
            subject.textContent = response.data.subject;
            initiatedBy.textContent = response.data.initiated_by;
            body.textContent = response.data.body;
            response.data.attachment_links.forEach(attachment => {
                attachmentsContainer.insertAdjacentHTML('beforeend', `<li class="list-group-item flex-item"><a href="${attachment.file_url}">${attachment.original_name}</a></li>`);
            });
            response.data.comments.forEach(data => {
                commentsContainer.insertAdjacentHTML('beforeend',`
                    <li class="comment">${data.comment}</li>
                    <p class="author text-muted">- ${data.author}</p>    
                `);
            });
            overlay.style.display = 'block';
            approvalBox.style.display = 'block';
        } catch (error) {
            console.error(error);
        }
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

postButton.addEventListener('click', async (event) => {
    if (userComment.value.trim() !== '') {
        try {
            await axios.post(`/workspace/${container.dataset.workspaceId}/pending-approvals/${approvalBox.dataset.approvalId}/comments`, {
                comment: userComment.value
            });
            userComment.value = '';
        } catch (error) {
            console.error(error);
        }
    }
});

const reject = document.querySelector('.reject-btn');
const approve = document.querySelector('.approve-btn');
const rejectPopover = new bootstrap.Popover(reject, {
    title: 'Are You Sure?',
    sanitize: false,
    html: true,
    content:  ` <div class="btn-group" role="group" aria-label="Basic mixed styles example">
                    <button type="button" class="btn btn-warning reject-confirm-btn">Confirm</button>
                    <button type="button" class="btn btn-info reject-cancel-btn">Cancel</button>
                </div>`
});

const approvePopover = new bootstrap.Popover(approve, {
    title: 'Are You Sure?',
    sanitize: false,
    html: true,
    content:  ` <div class="btn-group" role="group" aria-label="Basic mixed styles example">
                    <button type="button" class="btn btn-warning approve-confirm-btn">Confirm</button>
                    <button type="button" class="btn btn-info approve-cancel-btn">Cancel</button>
                </div>`
});

document.addEventListener('click', async (event) => {
    if (event.target.matches('.reject-cancel-btn')) {
        rejectPopover.hide();
    } else if (event.target.matches('.approve-cancel-btn')) {
        approvePopover.hide();
    } else if (event.target.matches('.reject-confirm-btn')) {
        try {
            await axios.post(`/workspace/${container.dataset.workspaceId}/pending-approvals/${approvalBox.dataset.approvalId}`, {
                status: "rejected", node_id: currentNodeId
            });
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    } else if (event.target.matches('.approve-confirm-btn')) {
        try {
            await axios.post(`/workspace/${container.dataset.workspaceId}/pending-approvals/${approvalBox.dataset.approvalId}`, {
                status: "approved", node_id: currentNodeId
            });
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    }
});