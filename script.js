// DOM Elements
let searchInput;
let allCards = []; // Initialize as an empty array to store card elements

// GLB Viewer Modal elements
let glbViewerModal;
let modelViewerInstance;
let viewerFilenameDisplay;
let viewerFolderNumberDisplay;
let viewerDownloadButton;
let viewerCopyFolderButton;
let glbViewerCloseButton; // Renamed for clarity

// Initial Warning Modal elements
let initialWarningModal;
let warningCloseButton;

// Helper function to reliably copy text to clipboard using document.execCommand
function copyTextToClipboard(text) {
    let textarea = document.createElement('textarea');
    textarea.value = text;
    // Make the textarea invisible and outside the viewport
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            console.log('Text copied successfully!');
        } else {
            console.warn('Copy command was unsuccessful.');
        }
    } catch (err) {
        console.error('Error copying text:', err);
    }
    document.body.removeChild(textarea);
}

// Card Creation
function createAndAppendCard(folder, filename, type) {
    // Create main card element
    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'flex'; // Ensure flex display for cards
    card.style.visibility = 'visible'; // Ensure visibility
    card.style.opacity = '1'; // Ensure visibility

    let mediaPath;

    // We are now only handling GLB types
    if (type.toLowerCase() === 'glb') {
        card.className += ' glb'; // Add glb class for specific styling
        // Construct the full path to the GLB file based on the new structure
        // The 'folder' variable now represents the 'long_number_folder'
        mediaPath = `./assets/${folder}/1/${filename}`; 

        // Create the 3D cube icon (primary click target for viewer)
        const viewIcon = document.createElement('i');
        viewIcon.className = 'fas fa-cube media-icon'; // FontAwesome 3D cube icon
        // Attach click listener to the icon to open the viewer
        viewIcon.onclick = (event) => {
            event.stopPropagation(); // Prevent card click event if icon is clicked
            openGlbViewer(mediaPath, folder, filename);
        };

        // Create element for the GLB filename display
        const glbFilenameDisplay = document.createElement('div');
        glbFilenameDisplay.className = 'glb-filename-display';
        glbFilenameDisplay.textContent = filename;

        // Create folder number button (now displaying the long_number_folder)
        const folderNumberButton = document.createElement('button');
        folderNumberButton.className = 'folder-number-button';
        folderNumberButton.textContent = `Folder: ${folder}`; // Display the folder name
        folderNumberButton.onclick = (event) => {
             event.stopPropagation(); // Prevent card click event
             copyTextToClipboard(folder); // Use the new helper function
             // Provide visual feedback
             folderNumberButton.textContent = 'Copied!';
             setTimeout(() => {
                 folderNumberButton.textContent = `Folder: ${folder}`;
             }, 1000);
        };

        // Wrapper for download and copy folder buttons on the card
        const glbButtonsWrapper = document.createElement('div');
        glbButtonsWrapper.className = 'glb-buttons-wrapper';

        // Download button for the card
        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-button';
        downloadButton.textContent = 'Download GLB';
        downloadButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card click event
            const link = document.createElement('a');
            link.href = mediaPath;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // Copy Folder button for the card (duplicate functionality for consistency)
        const copyFolderButton = document.createElement('button');
        copyFolderButton.className = 'copy-folder-button';
        copyFolderButton.textContent = 'Copy Folder';
        copyFolderButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card click event
            copyTextToClipboard(folder); // Use the new helper function
            // Provide visual feedback
            copyFolderButton.textContent = 'Copied!';
            setTimeout(() => {
                copyFolderButton.textContent = 'Copy Folder';
            }, 1000);
        };

        // Append elements to the GLB buttons wrapper
        glbButtonsWrapper.appendChild(downloadButton);
        glbButtonsWrapper.appendChild(copyFolderButton);

        // Append all elements to the card
        card.appendChild(viewIcon);
        card.appendChild(glbFilenameDisplay);
        card.appendChild(folderNumberButton);
        card.appendChild(glbButtonsWrapper);

        // Add a click listener to the card itself to also open the viewer
        card.onclick = () => {
            openGlbViewer(mediaPath, folder, filename);
        };

    } else {
        // This warning should not appear if glblist.txt only contains 'glb' entries
        console.warn(`Attempted to create a card of unsupported type: ${type}. Only 'glb' type is supported in this version.`);
        return; // Do not append card if type is not GLB
    }

    document.getElementById('texture-grid').appendChild(card);
    allCards.push(card); // Add card to the global list for filtering
}

// Search functionality
function filterCards() {
    const searchTerm = searchInput.value.toLowerCase();

    allCards.forEach(card => {
        // Assuming glb cards have glb-filename-display and folder-number-button elements
        const filenameElement = card.querySelector('.glb-filename-display');
        const folderButton = card.querySelector('.folder-number-button');

        const filename = filenameElement ? filenameElement.textContent.toLowerCase() : '';
        // Extract only the folder name from "Folder: X" (just X)
        const folderName = folderButton ? folderButton.textContent.replace('Folder: ', '').toLowerCase() : '';

        const matchesSearch = filename.includes(searchTerm) || folderName.includes(searchTerm);

        if (matchesSearch) {
            card.style.display = 'flex'; // Use flex display for cards
        } else {
            card.style.display = 'none';
        }
    });
}


// GLB Viewer Functions
function openGlbViewer(glbPath, folder, filename) {
    // Set text content in the modal
    viewerFilenameDisplay.textContent = filename;
    viewerFolderNumberDisplay.textContent = folder;

    // Set the source of the model-viewer
    modelViewerInstance.src = glbPath;

    // Attach download and copy folder actions to modal buttons
    viewerDownloadButton.onclick = () => {
        const link = document.createElement('a');
        link.href = glbPath;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    viewerCopyFolderButton.onclick = () => {
        copyTextToClipboard(folder); // Use the new helper function
        viewerCopyFolderButton.textContent = 'Copied!';
        setTimeout(() => {
            viewerCopyFolderButton.textContent = 'Copy Folder';
        }, 1000);
    };

    // Show the GLB viewer modal
    glbViewerModal.classList.add('active'); // Use class to toggle visibility and transition
    // Ensure model-viewer updates its rendering once visible
    if (modelViewerInstance.requestUpdate) {
        // This method can sometimes be called before model-viewer is fully ready.
        // A slight delay or waiting for a 'load' event on model-viewer might be more robust
        modelViewerInstance.requestUpdate(); 
    }
}

function closeGlbViewer() {
    glbViewerModal.classList.remove('active'); // Hide the modal
    // Optionally pause or reset the model-viewer
    // modelViewerInstance.pause(); // If you want to stop animation when closing
    // modelViewerInstance.src = ''; // Clear the model source to free up memory to prevent issues
}

// Function to show the initial warning modal
function showInitialWarning() {
    initialWarningModal.classList.add('active');
}

// Function to hide the initial warning modal
function hideInitialWarning() {
    initialWarningModal.classList.remove('active');
}


// Initialization
async function initializeGallery() {
    try {
        // Get DOM elements for the GLB viewer modal
        glbViewerModal = document.getElementById('glb-viewer-modal');
        modelViewerInstance = document.getElementById('model-viewer-instance');
        viewerFilenameDisplay = document.getElementById('viewer-filename');
        viewerFolderNumberDisplay = document.getElementById('viewer-folder-number');
        viewerDownloadButton = document.getElementById('viewer-download-button');
        viewerCopyFolderButton = document.getElementById('viewer-copy-folder-button');
        glbViewerCloseButton = glbViewerModal.querySelector('.close-button'); // Corrected variable name

        // Get DOM elements for the initial warning modal
        initialWarningModal = document.getElementById('initial-warning-modal');
        warningCloseButton = document.getElementById('warning-close-button');

        // Add event listener to the GLB viewer close button
        glbViewerCloseButton.onclick = closeGlbViewer;

        // Add event listener to the initial warning close button
        warningCloseButton.onclick = hideInitialWarning;

        // Close any modal if clicking outside its content (for both modals)
        window.onclick = (event) => {
            if (event.target === glbViewerModal) {
                closeGlbViewer();
            } else if (event.target === initialWarningModal) {
                hideInitialWarning();
            }
        };

        // Set up search input and buttons
        searchInput = document.getElementById('texture-search');
        document.getElementById('search-button').addEventListener('click', filterCards);
        document.getElementById('clear-search-button').addEventListener('click', () => {
            searchInput.value = '';
            filterCards(); // Re-filter to show all cards
        });
        searchInput.addEventListener('input', filterCards); // Live search

        // Load GLB files from glblist.txt
        try {
            const glbResponse = await fetch('glblist.txt');
            if (!glbResponse.ok) {
                console.error('Failed to fetch glblist.txt. Please ensure it exists and is accessible.');
            } else {
                const glbText = await glbResponse.text();
                const glbLines = glbText.trim().split('\n');

                for (const line of glbLines) {
                    const [folder, filename] = line.split(' ');
                    if (folder && filename) {
                        createAndAppendCard(folder, filename, 'glb');
                    }
                }
            }
        } catch (error) {
            console.error('Error loading GLB files from glblist.txt:', error);
        }

        // `allCards` is populated in `createAndAppendCard`
        // No need to querySelectorAll here as it's built incrementally

        // Show the initial warning modal once the gallery is initialized
        showInitialWarning();

    } catch (error) {
        console.error('Error initializing gallery:', error);
    }
}

// Initialize the gallery when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeGallery);
