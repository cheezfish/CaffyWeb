// Update info text dynamically
function updateInfo(message) {
  const infoElement = document.getElementById('info');
  const infoBox = document.getElementById('infoBox');
  
  infoElement.textContent = message;
  infoBox.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  const infoBox = document.getElementById('infoBox');
  const buttons = ['effect', 'flavour', 'about'];
  const modelViewer = document.querySelector('#animation-demo');

  // Start with infoBox hidden
  infoBox.style.display = 'none';

  // Click event for each button
  buttons.forEach(buttonId => {
    document.querySelector(`#${buttonId}`).addEventListener('click', () => {
      switch(buttonId) {
        case 'effect':
          modelViewer.cameraOrbit = '130deg 90deg 3m';
          updateInfo('Energy, memory, focus. Caffeine from guarana, with supplements and nootropics including L-Theanine, Alpha-GPC, and Rhodiola Rosea.');
          break;
        case 'flavour':
          modelViewer.cameraOrbit = '90deg 0deg 3m';
          updateInfo('Cool Mint is our first flavour compound, but new formulae are in development. Expect to see blueberry, grape, and cherry soon!');
          break;
        case 'about':
          modelViewer.cameraOrbit = '270deg 180deg 4m';
          updateInfo('CAFFY was founded by Turab Ali Zia and Imran Azizuddin, with a mission to create the perfect blend of nootropic supplements.');
          break;
      }
    });
  });

  // Close infoBox if clicked outside
  document.addEventListener('click', (event) => {
    if (!infoBox.contains(event.target) && 
        !buttons.some(buttonId => document.querySelector(`#${buttonId}`).contains(event.target))) {
      infoBox.style.display = 'none';
    }
  });
});

// Modal handling code remains the same as in previous version
const modal = document.getElementById("checkout-modal");
const closeBtn = document.querySelector(".close");
const buyNowBtn = document.querySelector(".button-primary.label");

buyNowBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
});