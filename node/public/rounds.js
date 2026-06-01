const approvalRoundsLink = document.querySelector('.approval-rounds-link');
const viewApprovalButtons = document.querySelectorAll('.view-approval-button');
const overlay = document.querySelector('.overlay');
const closeFormss = document.querySelectorAll('.close-forms');
const approvalBox = document.querySelector('.approval-box');
const container = document.querySelector('.container');
const roundBox = document.querySelector('.round-box');
const roundName = document.querySelector('.round-name');
const levelsContainer = document.querySelector('.levels-container');

approvalRoundsLink.classList.add('active');

function getFullWidth(element) {
    const style = window.getComputedStyle(element)
    const marginLeft = parseFloat(style.marginLeft)
    const marginRight = parseFloat(style.marginRight)
    return element.offsetWidth + marginLeft + marginRight
}

let numItems = 0, style, paddingLeft, paddingRight, contentWidth, response, newItem, newSublevel, tempButton, totalCount, counter, state, temp;

window.addEventListener('resize', (event) => {
    
});

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
            response = await axios.get(`/rounds/${event.target.closest('.items').dataset.roundId}`);
            roundName.textContent = response.data.roundName;
            levelsContainer.innerHTML = '';
            overlay.style.display = 'block';
            roundBox.style.display = 'block';
            newItem = document.createElement('div');
            newItem.className = 'level';
            levelsContainer.appendChild(newItem);
            newItem.insertAdjacentHTML('beforeend', '<button class="btn btn-success btn-sm node-button text-truncate">1234256789</button>');
            tempButton = newItem.lastElementChild;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {                    
                    style = window.getComputedStyle(newItem);
                    paddingLeft = parseFloat(style.paddingLeft);
                    paddingRight = parseFloat(style.paddingRight);
                    contentWidth = newItem.clientWidth - paddingLeft - paddingRight;
                    numItems = Math.floor(contentWidth/getFullWidth(tempButton));
                    levelsContainer.innerHTML = '';
        
                    response.data.levels.forEach(elem => {
                        totalCount = elem.nodes.length;
                        state = false;
                        newItem = document.createElement('div');
                        newItem.className = 'level';
                        levelsContainer.appendChild(newItem);
                        temp = 0;
                        while (true) {
                            newSublevel = document.createElement('div');
                            newSublevel.className = 'sublevel';

                            if (state) {
                                newSublevel.classList.add('sublevel-reverse');
                            }
                            newItem.appendChild(newSublevel);
                            for (let i = temp; i < numItems+temp; i++) {
                                if (elem.nodes[i].status === 'approved') {
                                    newSublevel.insertAdjacentHTML('beforeend', `<button class="btn btn-success btn-sm node-button text-truncate">${elem.nodes[i].firstName}</button>`);
                                }  else if (elem.nodes[i].status === 'pending') {
                                    newSublevel.insertAdjacentHTML('beforeend', `<button class="btn btn-secondary btn-sm node-button text-truncate">${elem.nodes[i].firstName}</button>`);
                                } else if (elem.nodes[i].status === 'rejected') {
                                    newSublevel.insertAdjacentHTML('beforeend', `<button class="btn btn-danger btn-sm node-button text-truncate">${elem.nodes[i].firstName}</button>`);
                                }
                                totalCount -= 1;
                                if (totalCount === 0) {
                                    break;
                                }
                            }
                            temp += numItems;
                            if (totalCount === 0) {
                                break;
                            }
                            state = !state;
                        }
                    });
                });
            });
        } catch (error) {
            console.error(error);
        }
    }
});

closeFormss.forEach(closeForms => {
    closeForms.addEventListener('click', (event) => {
        approvalBox.style.display = 'none';
        roundBox.style.display = 'none';
        overlay.style.display = 'none';
    });
})

overlay.addEventListener('click', (event) => {
    approvalBox.style.display = 'none';
    roundBox.style.display = 'none';
    overlay.style.display = 'none';
});
