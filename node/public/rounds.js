const approvalRoundsLink = document.querySelector('.approval-rounds-link');
const viewApprovalButtons = document.querySelectorAll('.view-approval-button');
const overlay = document.querySelector('.overlay');
const closeForms = document.querySelector('.close-forms');
const approvalBox = document.querySelector('.approval-box');
const container = document.querySelector('.container');

approvalRoundsLink.classList.add('active');

container.addEventListener('click', (event) => {
    if (event.target.matches('.view-approval-button')) {
        // axios.get(`/workspace/${item.dataset.approvalId}`)
        // .then(response => {})
        // .catch(error => {console.error("Error fetching approval:", error);
        
        // });
        overlay.style.display = 'block';
        approvalBox.style.display = 'block';
    }
})

closeForms.addEventListener('click', (event) => {
    approvalBox.style.display = 'none';
    overlay.style.display = 'none';
});

overlay.addEventListener('click', (event) => {
    approvalBox.style.display = 'none';
    overlay.style.display = 'none';
});
