// Fetch backend health endpoint
document.addEventListener('DOMContentLoaded', () => {
    const statusElement = document.getElementById('backend-status');

    fetch('/api/health')
        .then(response => response.json())
        .then(data => {
            statusElement.textContent = data.status;
            statusElement.style.color = 'green';
        })
        .catch(error => {
            statusElement.textContent = 'Error';
            statusElement.style.color = 'red';
        });
});