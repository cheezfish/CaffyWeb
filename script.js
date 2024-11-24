  // Update info text dynamically
  function updateInfo(message) {
    const infoElement = document.getElementById('info');
    const infoBox = document.getElementById('infoBox');
    
    infoElement.textContent = message; // Change the displayed text
    infoBox.style.display = 'block';
    
    // Set a timeout to hide the infoBox after a specific duration (e.g., 3 seconds)
    setTimeout(() => {
    infoBox.style.display = 'none';  // Hide the infobox after 3 seconds
  }, 10000); // 3000ms = 3 seconds
  }

  document.querySelector('#effect').addEventListener('click', () => {
    const modelViewer = document.querySelector('#animation-demo');
    
    // Rotate further to the left view (adjusted for more side angle)
    modelViewer.cameraOrbit = '130deg 90deg 3m';
  
    // Update info text
    updateInfo('Energy, memory, focus. Caffeine from guarana, with supplements and nootropics including L-Theanine, Alpha-GPC, and Rhodiola Rosea.');

    // Remove any active state or styling from the button
    const effectButton = document.querySelector('#effect');
    effectButton.classList.remove('active'); 
    effectButton.style.backgroundColor = ''; 
  });

  document.querySelector('#flavour').addEventListener('click', () => {
    const modelViewer = document.querySelector('#animation-demo');
    modelViewer.cameraOrbit = '90deg 0deg 3m'; 

    // Update info text
    updateInfo('Cool Mint is our first flavour compound, but new formulae are in development. Expect to see blueberry, grape, and cherry soon!');

    const flavourButton = document.querySelector('#flavour');
    flavourButton.classList.remove('active'); 
    flavourButton.style.backgroundColor = ''; 
  });

  document.querySelector('#about').addEventListener('click', () => {
    const modelViewer = document.querySelector('#animation-demo');
    modelViewer.cameraOrbit = '270deg 180deg 4m'; 

    // Update info text
    updateInfo('CAFFY was founded by Turab Ali Zia and Imran Azizuddin, with a mission to create the perfect blend of nootropic supplements.');
    const aboutButton = document.querySelector('#about');
    aboutButton.classList.remove('active'); 
    aboutButton.style.backgroundColor = ''; 
  });
  
  // Modal elements
  const modal = document.getElementById("checkout-modal");
  const closeBtn = document.querySelector(".close");
  const buyNowBtn = document.querySelector(".button-primary.label");

  // Show the modal when "BUY NOW" button is clicked
  buyNowBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Close the modal when the close button is clicked
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close the modal if the user clicks anywhere outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });



