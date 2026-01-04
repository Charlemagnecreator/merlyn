let currentUserName = 'guest';
let folders = [];
let currentFolderId = null;
let gallery = [];

// DOM Elements
const app = document.getElementById('app');
const fileInput = document.getElementById('fileInput');
const cameraBtn = document.getElementById('cameraBtn');
const uploadBtn = document.getElementById('uploadBtn');
const showQrBtn = document.getElementById('showQrBtn');
const cameraModal = document.getElementById('cameraModal');
const cameraVideo = document.getElementById('cameraVideo');
const cameraCapture = document.getElementById('cameraCapture');
const cameraFlip = document.getElementById('cameraFlip');
const cameraClose = document.getElementById('cameraClose');
const uploadArea = document.getElementById('uploadArea');
const gallerySection = document.getElementById('gallerySection');
const galleryContainer = document.getElementById('gallery');
const galleryModal = document.getElementById('galleryModal');
const galleryModalImage = document.getElementById('galleryModalImage');
const galleryDownload = document.getElementById('galleryDownload');
const galleryClose = document.getElementById('galleryClose');
const qrModal = document.getElementById('qrModal');
const qrCard = document.getElementById('qrCard');
const qrImage = document.getElementById('qrImage');
const pageUrl = document.getElementById('pageUrl');
const copyUrl = document.getElementById('copyUrl');
const downloadQr = document.getElementById('downloadQr');
const closeQr = document.getElementById('closeQr');
const openLink = document.getElementById('openLink');
const createFolderModal = document.getElementById('createFolderModal');
const folderCard = document.getElementById('folderCard');
const folderNameInput = document.getElementById('folderNameInput');
const ownerNameInput = document.getElementById('ownerNameInput');
const confirmFolderBtn = document.getElementById('confirmFolderBtn');
const cancelFolderBtn = document.getElementById('cancelFolderBtn');
const folderBackdrop = document.getElementById('folderBackdrop');

let facingMode = 'environment';

// Initialize app
async function initApp() {
    const storedUser = localStorage.getItem('userName') || 'guest';
    currentUserName = storedUser;
    await loadFoldersUI();
}

// Load folders from Supabase
async function loadFoldersUI() {
    folders = await loadFolders(currentUserName);
    renderGallery();
}

// Create new folder
async function createNewFolder() {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    const newFolder = await createFolder(folderName, currentUserName);
    if (newFolder) {
        folders.unshift(newFolder);
        renderGallery();
    }
}

// Load pictures from current folder
async function loadPicturesUI(folderId) {
    currentFolderId = folderId;
    gallery = await loadPicturesFromFolder(folderId);
    renderGallery();
}

// Render gallery thumbnails
function renderGallery() {
    galleryContainer.innerHTML = '';

    if (currentFolderId) {
        // Display pictures from folder
        gallery.forEach((picture, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'relative group cursor-pointer';
            thumb.innerHTML = `
        <img src="${picture.picture_url}" alt="Gallery" class="w-full h-40 object-cover rounded-lg shadow hover:shadow-lg transition">
        <button class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition text-xs">Delete</button>
      `;
            thumb.querySelector('img').addEventListener('click', () => openGalleryModal(picture));
            thumb.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                deletePictureUI(picture.id);
            });
            galleryContainer.appendChild(thumb);
        });
    } else {
        // Display folders
        folders.forEach((folder) => {
            const folderEl = document.createElement('div');
            folderEl.className = 'p-4 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer';
            folderEl.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="text-3xl">📁</div>
          <div class="flex-1">
            <div class="font-semibold">${folder.name}</div>
            <div class="text-sm text-gray-500">Click to open</div>
          </div>
          <button class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">Delete</button>
        </div>
      `;
            folderEl.querySelector('div').addEventListener('click', () => loadPicturesUI(folder.id));
            folderEl.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFolderUI(folder.id);
            });
            galleryContainer.appendChild(folderEl);
        });

        // Add new folder button
        const addBtn = document.createElement('div');
        addBtn.className = 'p-4 bg-indigo-100 rounded-lg shadow hover:shadow-md transition cursor-pointer border-2 border-dashed border-indigo-300';
        addBtn.innerHTML = '<div class="text-center text-2xl">➕ New Folder</div>';
        addBtn.addEventListener('click', createNewFolder);
        galleryContainer.appendChild(addBtn);
    }
}

// Create Folder Button - Open Modal
createFolderBtn.addEventListener('click', () => {
    folderNameInput.value = '';
    ownerNameInput.value = currentUserName; // Pre-fill with current user
    createFolderModal.classList.remove('hidden');
    createFolderModal.classList.add('flex');
    setTimeout(() => {
        folderCard.classList.remove('scale-95', 'opacity-0');
        folderCard.classList.add('scale-100', 'opacity-100');
        folderNameInput.focus();
    }, 10);
});

// Confirm Folder Creation
confirmFolderBtn.addEventListener('click', async () => {
    const folderName = folderNameInput.value.trim();
    const ownerName = ownerNameInput.value.trim();

    if (!folderName) {
        alert('Please enter a folder name');
        folderNameInput.focus();
        return;
    }

    if (!ownerName) {
        alert('Please enter an owner name');
        ownerNameInput.focus();
        return;
    }

    const newFolder = await createFolder(folderName, ownerName);
    if (newFolder) {
        currentUserName = ownerName; // Update current user
        localStorage.setItem('userName', ownerName);
        folders.unshift(newFolder);
        closeFolderModal();
        renderGallery();
    } else {
        alert('Failed to create folder. Try again.');
    }
});

// Cancel Folder Creation
cancelFolderBtn.addEventListener('click', closeFolderModal);

// Close folder modal
function closeFolderModal() {
    folderCard.classList.add('scale-95', 'opacity-0');
    folderCard.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        createFolderModal.classList.add('hidden');
        createFolderModal.classList.remove('flex');
    }, 200);
}

// Close modal when backdrop clicked
folderBackdrop.addEventListener('click', closeFolderModal);

// Allow Enter key to submit
folderNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ownerNameInput.focus();
});

ownerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') confirmFolderBtn.click();
});

// Remove the old createNewFolder function that uses prompt
async function createNewFolder() {
    createFolderBtn.click(); // Open modal instead
}

// Delete folder
async function deleteFolderUI(folderId) {
    if (!confirm('Delete this folder and all pictures?')) return;
    const success = await deleteFolder(folderId);
    if (success) {
        folders = folders.filter(f => f.id !== folderId);
        renderGallery();
    }
}

// Delete picture
async function deletePictureUI(pictureId) {
    if (!confirm('Delete this picture?')) return;
    const success = await deletePicture(pictureId);
    if (success) {
        gallery = gallery.filter(p => p.id !== pictureId);
        renderGallery();
    }
}

// Camera functionality
cameraBtn.addEventListener('click', async () => {
    cameraModal.classList.remove('hidden');
    cameraModal.classList.add('flex');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode }
        });
        cameraVideo.srcObject = stream;
    } catch (e) {
        alert('Camera access denied');
        cameraModal.classList.add('hidden');
        cameraModal.classList.remove('flex');
    }
});

cameraFlip.addEventListener('click', () => {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    const stream = cameraVideo.srcObject;
    stream.getTracks().forEach(track => track.stop());
    navigator.mediaDevices.getUserMedia({ video: { facingMode } })
        .then(newStream => { cameraVideo.srcObject = newStream; });
});

cameraCapture.addEventListener('click', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraVideo, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

    if (currentFolderId) {
        const pictureUrl = await uploadPictureFile(currentFolderId, file);
        if (pictureUrl) {
            await addPictureToFolder(currentFolderId, pictureUrl);
            await loadPicturesUI(currentFolderId);
        }
    }

    cameraModal.classList.add('hidden');
    cameraModal.classList.remove('flex');
    cameraVideo.srcObject.getTracks().forEach(track => track.stop());
});

cameraClose.addEventListener('click', () => {
    cameraModal.classList.add('hidden');
    cameraModal.classList.remove('flex');
    cameraVideo.srcObject.getTracks().forEach(track => track.stop());
});

// File upload
uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !currentFolderId) {
        alert('Please open a folder first');
        return;
    }

    const pictureUrl = await uploadPictureFile(currentFolderId, file);
    if (pictureUrl) {
        await addPictureToFolder(currentFolderId, pictureUrl);
        await loadPicturesUI(currentFolderId);
    }
    fileInput.value = '';
});

// Gallery modal
function openGalleryModal(picture) {
    galleryModalImage.src = picture.picture_url;
    galleryDownload.href = picture.picture_url;
    galleryDownload.download = `merlyn-${Date.now()}.jpg`;
    galleryModal.classList.remove('hidden');
    galleryModal.classList.add('flex');
}

galleryClose.addEventListener('click', () => {
    galleryModal.classList.add('hidden');
    galleryModal.classList.remove('flex');
});

document.getElementById('galleryBackdrop').addEventListener('click', () => {
    galleryModal.classList.add('hidden');
    galleryModal.classList.remove('flex');
});

// QR Code functionality
showQrBtn.addEventListener('click', async () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.href)}`;
    qrImage.src = qrUrl;
    pageUrl.textContent = window.location.href;
    downloadQr.href = qrUrl;

    qrModal.classList.remove('hidden');
    qrModal.classList.add('flex');
    setTimeout(() => {
        qrCard.classList.remove('scale-95', 'opacity-0');
        qrCard.classList.add('scale-100', 'opacity-100');
    }, 10);
});

copyUrl.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    copyUrl.textContent = 'Copied!';
    setTimeout(() => { copyUrl.textContent = 'Copy URL'; }, 2000);
});

openLink.addEventListener('click', () => {
    window.open(window.location.href, '_blank');
});

closeQr.addEventListener('click', () => {
    qrModal.classList.add('hidden');
    qrModal.classList.remove('flex');
    qrCard.classList.add('scale-95', 'opacity-0');
    qrCard.classList.remove('scale-100', 'opacity-100');
});

document.getElementById('qrBackdrop').addEventListener('click', () => {
    qrModal.classList.add('hidden');
    qrModal.classList.remove('flex');
});

// Initialize on load
window.addEventListener('DOMContentLoaded', initApp);