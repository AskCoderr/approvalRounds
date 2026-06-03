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

let numItems = 0, style, paddingLeft, paddingRight, contentWidth, response, newItem, newSublevel, tempButton, totalCount, counter, state, temp, gap, previousLevel, previousButton, newButton, nodeDown = false, nodeLeft = false, popover, previousPopover;

function getFullWidth(element) {
    const style = window.getComputedStyle(element)
    const marginLeft = parseFloat(style.marginLeft)
    const marginRight = parseFloat(style.marginRight)
    return element.offsetWidth + marginLeft + marginRight
}

const connStyle = {
    paintStyle: { stroke: "#00ADB5", strokeWidth: 2 },
    endpoint: "Blank",
    overlays: [["Arrow", { width: 7, length: 7, location: 1, paintStyle: { fill: "#00ADB5" } }]]
};

function render() {
    style = window.getComputedStyle(newSublevel);
    paddingLeft = parseFloat(style.paddingLeft);
    paddingRight = parseFloat(style.paddingRight);
    contentWidth = newSublevel.clientWidth - paddingLeft - paddingRight;
    gap = parseFloat(style.gap);
    numItems = Math.floor((contentWidth + gap) / (getFullWidth(tempButton) + gap));
    levelsContainer.innerHTML = '';
    jsPlumb.reset();
    jsPlumb.setContainer(levelsContainer);
    previousLevel = null;

    response.data.levels.forEach(elem => {
        totalCount = elem.nodes.length;
        state = false;
        newItem = document.createElement('div');
        newItem.className = 'level';
        levelsContainer.appendChild(newItem);
        temp = 0;
        previousButton = false;
        while (true) {
            newSublevel = document.createElement('div');
            newSublevel.className = 'sublevel';

            if (state) {
                newSublevel.classList.add('sublevel-reverse');
                nodeLeft = true;
            } else {
                nodeLeft = false;
            }
            newItem.appendChild(newSublevel);
            for (let i = temp; i < numItems + temp; i++) {
                newButton = document.createElement('button');
                newButton.dataset.nodeId = elem.nodes[i].id;
                newButton.dataset.levelId = elem.id;
                if (elem.nodes[i].status === 'Approved') {
                    newButton.classList.add('btn', 'btn-success', 'btn-sm', 'node-button', 'text-truncate');
                    newButton.textContent = elem.nodes[i].firstName;
                } else if (elem.nodes[i].status === 'Pending') {
                    newButton.classList.add('btn', 'btn-secondary', 'btn-sm', 'node-button', 'text-truncate');
                    newButton.textContent = elem.nodes[i].firstName;
                } else if (elem.nodes[i].status === 'Rejected') {
                    newButton.classList.add('btn', 'btn-danger', 'btn-sm', 'node-button', 'text-truncate');
                    newButton.textContent = elem.nodes[i].firstName;
                }
                newSublevel.appendChild(newButton);
                if (elem.type === 'series') {
                    if (previousButton) {
                        if (nodeDown && nodeLeft) {
                            jsPlumb.connect({
                                source: previousButton,
                                target: newButton,
                                anchors: ["Right", "Right"],
                                connector: ["Flowchart", { stub: 10, cornerRadius: 5 }],
                                ...connStyle
                            });
                        } else if (nodeDown) {
                            jsPlumb.connect({
                                source: previousButton,
                                target: newButton,
                                anchors: ["Left", "Left"],
                                connector: ["Flowchart", { stub: 10, cornerRadius: 5 }],
                                ...connStyle
                            });
                        } else if (nodeLeft) {
                            jsPlumb.connect({
                                source: previousButton,
                                target: newButton,
                                anchors: ["Left", "Right"],
                                connector: ["Straight"],
                                ...connStyle
                            });
                        } else {
                            jsPlumb.connect({
                                source: previousButton,
                                target: newButton,
                                anchors: ["Right", "Left"],
                                connector: ["Straight"],
                                ...connStyle
                            });
                        }
                    }
                }
                previousButton = newButton;
                totalCount -= 1;
                if (totalCount === 0) {
                    break;
                }
                nodeDown = false;
            }
            temp += numItems;
            if (totalCount === 0) {
                break;
            }
            state = !state;
            nodeDown = true;
        }
        if (previousLevel) {
            jsPlumb.connect({
                source: previousLevel,
                target: newItem,
                anchors: ["Bottom", "Top"],
                connector: ["Straight"],
                paintStyle: { stroke: "#222831", strokeWidth: 2 },
                endpoint: "Blank",
                overlays: [["Arrow", { width: 7, length: 7, location: 1, paintStyle: { fill: "#222831" } }]]
            });
        }
        previousLevel = newItem;
    });
}

function destroyAllPopovers() {
    previousPopover = null, popover = null;
    const allPopovers = document.querySelectorAll('.popover');
    allPopovers.forEach(popoverEl => {
        const popoverId = popoverEl.getAttribute('id');
        const triggerBtn = document.querySelector(`[aria-describedby="${popoverId}"]`);
        if (triggerBtn) {
            const instance = bootstrap.Popover.getInstance(triggerBtn);
            if (instance) {
                instance.dispose();
            }
        } else {
            popoverEl.remove();
        }
    });
}

window.addEventListener('resize', (event) => {
    if (getComputedStyle(roundBox).display === 'block') {
        destroyAllPopovers();
        newSublevel = document.querySelector('.sublevel');
        tempButton = document.querySelector('.node-button');
        render();
        requestAnimationFrame(() => {
            jsPlumb.repaintEverything();
        });
    }  
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
            newSublevel = document.createElement('div');
            newItem.className = 'level';
            newSublevel.className = 'sublevel';
            levelsContainer.appendChild(newItem);
            newItem.appendChild(newSublevel);
            newSublevel.insertAdjacentHTML('beforeend', '<button class="btn btn-success btn-sm node-button text-truncate">1234256789</button>');
            tempButton = newSublevel.lastElementChild;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    render();
                    requestAnimationFrame(() => {
                        jsPlumb.repaintEverything();
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

let tempNode;
let color;
levelsContainer.addEventListener('click', (event) => {
    if (event.target.matches('.node-button')) {
        popover = bootstrap.Popover.getInstance(event.target);
        if (!popover) {            
            tempNode = response.data.levels.find(lvl => lvl.id == event.target.dataset.levelId).nodes.find(nde => nde.id == event.target.dataset.nodeId);
            if (tempNode.status === 'Approved') {
                color = 'success';
            } else if (tempNode.status === 'Pending') {
                color = 'secondary';
            } else if (tempNode.status === 'Rejected') {
                color = 'danger';
            }
            popover = new bootstrap.Popover(event.target, {
                title: tempNode.status.toUpperCase(),
                html: true,
                sanitize: false, 
                content: `
                    <h6>${tempNode.userName}</h6>
                    <p>${tempNode.userMail}</p>
                    ${tempNode.status === 'Pending' ? `<button type="button" class="btn btn-primary btn-sm mx-auto d-block">Postpone</button>` : ''}
                `,
                trigger: 'manual',
                customClass: `popover-font text-${color}`
            });
        }
        if (previousPopover && previousPopover !== popover) {            
            previousPopover.hide();
        }
        if (previousPopover !== popover || !popover._isShown()) {
            popover.show();
        }
        previousPopover = popover;
    }
});

document.addEventListener('click', (event) => {
    if (event.target.matches('.node-button') || event.target.closest('.popover')) {
        return; 
    }
    if (previousPopover) {
        previousPopover.hide();
    }
});