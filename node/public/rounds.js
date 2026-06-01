const approvalRoundsLink = document.querySelector('.approval-rounds-link');
const viewApprovalButtons = document.querySelectorAll('.view-approval-button');
const overlay = document.querySelector('.overlay');
const closeForms = document.querySelector('.close-forms');
const approvalBox = document.querySelector('.approval-box');
const container = document.querySelector('.container');
const roundBox = document.querySelector('.round-box');
const roundName = document.querySelector('.round-name');

approvalRoundsLink.classList.add('active');

container.addEventListener('click', async (event) => {
    if (event.target.matches('.view-approval-button')) {
        // axios.get(`/workspace/${item.dataset.approvalId}`)
        // .then(response => {})
        // .catch(error => {console.error("Error fetching approval:", error);
        
        // });
        overlay.style.display = 'block';
        approvalBox.style.display = 'block';
    } else if (event.target.closest('.items')) {
        try {
            const response = await axios.get(`/rounds/${event.target.closest('.items').dataset.roundId}`);
            roundName.textContent = response.data.roundName;
        } catch (error) {
            console.error(error);
        }
        overlay.style.display = 'block';
        roundBox.style.display = 'block';
    }
});

closeForms.addEventListener('click', (event) => {
    approvalBox.style.display = 'none';
    roundBox.style.display = 'none';
    overlay.style.display = 'none';
});

overlay.addEventListener('click', (event) => {
    approvalBox.style.display = 'none';
    roundBox.style.display = 'none';
    overlay.style.display = 'none';
});
