const firstName = document.querySelector('.first-name');
const accountInfo = document.querySelector('.account-info');
firstName.addEventListener('click', (event) => {
    event.stopPropagation();
    const dispValue = window.getComputedStyle(accountInfo).display;
    if (dispValue === 'none') {
        accountInfo.style.display = 'flex';
    } else {
        accountInfo.style.display = 'none';
    }
});

accountInfo.addEventListener('click', (event) => {
    event.stopPropagation();
});

document.documentElement.addEventListener('click', (event) => {
    accountInfo.style.display = 'none';
})