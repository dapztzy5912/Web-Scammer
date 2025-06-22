document.addEventListener('DOMContentLoaded', function() {
    const addScammerBtn = document.getElementById('addScammerBtn');
    const scammerModal = document.getElementById('scammerModal');
    const closeBtn = document.querySelector('.close-btn');
    const scammerForm = document.getElementById('scammerForm');
    const scammerList = document.getElementById('scammerList');
    
    // Load scammer data when page loads
    loadScammers();
    
    // Modal controls
    addScammerBtn.addEventListener('click', () => {
        scammerModal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
        scammerModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === scammerModal) {
            scammerModal.style.display = 'none';
        }
    });
    
    // Form submission
    scammerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch('/api/scammers', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Scammer berhasil ditambahkan!');
                scammerForm.reset();
                scammerModal.style.display = 'none';
                loadScammers();
            } else {
                alert('Gagal menambahkan scammer: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat mengirim data');
        });
    });
    
    // Function to load scammer list
    function loadScammers() {
        fetch('/api/scammers')
            .then(response => response.json())
            .then(data => {
                scammerList.innerHTML = '';
                
                if (data.length === 0) {
                    scammerList.innerHTML = '<p class="no-data">Belum ada data scammer</p>';
                    return;
                }
                
                data.forEach(scammer => {
                    const scammerCard = document.createElement('div');
                    scammerCard.className = 'scammer-card';
                    
                    let imagesHTML = '';
                    if (scammer.proofImages && scammer.proofImages.length > 0) {
                        imagesHTML = `<div class="scammer-images">`;
                        scammer.proofImages.forEach(img => {
                            imagesHTML += `<img src="/uploads/${img}" alt="Bukti ${scammer.name}">`;
                        });
                        imagesHTML += `</div>`;
                    }
                    
                    let phoneHTML = scammer.phoneNumber ? `<p><strong>Nomor:</strong> ${scammer.phoneNumber}</p>` : '';
                    let websiteHTML = scammer.websiteUrl ? `<p><strong>Website:</strong> <a href="${scammer.websiteUrl}" target="_blank">${scammer.websiteUrl}</a></p>` : '';
                    let descHTML = scammer.description ? `<p><strong>Deskripsi:</strong> ${scammer.description}</p>` : '';
                    
                    scammerCard.innerHTML = `
                        ${imagesHTML}
                        <div class="scammer-info">
                            <h3>${scammer.name}</h3>
                            <span class="scam-type">${scammer.scamType}</span>
                            <div class="scammer-details">
                                ${phoneHTML}
                                ${websiteHTML}
                                ${descHTML}
                            </div>
                        </div>
                    `;
                    
                    scammerList.appendChild(scammerCard);
                });
            })
            .catch(error => {
                console.error('Error loading scammers:', error);
                scammerList.innerHTML = '<p class="error">Gagal memuat data scammer</p>';
            });
    }
});
