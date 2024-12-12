// CAFFY Interactive Model Viewer Script

document.addEventListener('DOMContentLoaded', () => {
  const infoBox = document.getElementById('infoBox');
  const buttons = ['effect', 'flavour', 'about', 'buyNowBtn', 'footerButton'];
  const modelViewer = document.querySelector('#animation-demo');
  const footer = document.getElementById('footer');
  const footerButton = document.getElementById('footerButton');

  // Function to hide footer
  function hideFooter() {
    footer.style.display = 'none';
    footerButton.style.bottom = '0%';
  }

  // Function to show footer
  function showFooter() {
    footer.style.display = 'flex';
    footerButton.style.bottom = '12%';
  }

  // Toggle footer when footer button is clicked
  footerButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (footer.style.display === 'none' || footer.style.display === '') {
      showFooter();
    } else {
      hideFooter();
    }
  });

  // Hide footer when clicking outside
  document.addEventListener('click', (event) => {
    if ((footer.style.display === 'flex') && 
        !footer.contains(event.target) && 
        !footerButton.contains(event.target)) {
      hideFooter();
    }
  });

  // Initialize footer as hidden
  footer.style.display = 'none';


  // Utility function to update info text
  function updateInfo(message) {
    const infoElement = document.getElementById('info');
    const infoBox = document.getElementById('infoBox');
    
    infoElement.innerHTML = message;
    infoBox.style.display = 'block';
  }

  // Start with infoBox hidden
  infoBox.style.display = 'none';

  // Click event for each button
  buttons.forEach(buttonId => {
    document.querySelector(`#${buttonId}`).addEventListener('click', () => {
      switch(buttonId) {
        case 'effect':
          modelViewer.cameraOrbit = '130deg 90deg 3m';
          variantBox.style.display = 'none';
          if (window.innerWidth >= 1025) {
            updateInfo('Energy, memory, focus. Caffeine from guarana, with nootropics including Taurine, L-Theanine, Alpha-GPC, and Rhodiola Rosea. <br><br>Our unique blend supports mental clarity, reduces fatigue, and enhances brain function.');
          } else {
            updateInfo('Energy, memory, focus. Caffeine from guarana, with nootropics including Taurine, L-Theanine, Alpha-GPC, and Rhodiola Rosea.');
          }
          break;

        case 'flavour':
          modelViewer.cameraOrbit = '90deg 0deg 3m';
          variantBox.style.display = 'block';
          if (window.innerWidth >= 1025) {
            updateInfo('Available in Cool Mint and Blueberry. Optimized for potency and flavor duration. <br><br>Our range of flavours will soon include Kiwi, Mango, and Melon.');
          } else {
            updateInfo('Available in Cool Mint and Blueberry. Optimized for potency and flavor duration.');
          }
          break;

        case 'about':
          modelViewer.cameraOrbit = '270deg 180deg 4m';
          variantBox.style.display = 'none';
          if (window.innerWidth >= 1025) {
            updateInfo('CAFFY was founded with a mission to create the perfect blend of nootropic supplements. <br><br>Our aim is to reimagine the way we utilise caffeine, and deliver positive tangible effects with complete transparency.');
          } else {
            updateInfo('CAFFY was founded with a mission to create the perfect blend of nootropic supplements. Our aim is to reimagine the way we utilise caffeine.');
          }
            break;

          case 'buyNowBtn':
            modelViewer.cameraOrbit = '90deg 65deg 4m';
            isTouching = true;
            // Hide all lines first
            lines.forEach(line => line.classList.add('hide'));
            modelViewer.play({ repetitions: 1 });

            // Delay transition to allow animation to complete
            setTimeout(() => {
              // Trigger transition
              transitionOverlay.style.transform = 'scale(3)';
              
              // Redirect after transition
              setTimeout(() => {
                window.location.href = 'https://ibb.co/FDGQGDb';
              }, 900); // matches transition duration
            }, 900); // Adjust this number to match your model viewer's animation duration
            
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

  // Model Viewer Animation Cycle
  const orbitCycle = [
    '90deg 0deg 3m', // Top view
    '0deg 0deg 3m', // Top rotated -90
    '0deg 90deg 3m', // Left side
    '120deg 90deg 3m', // Left side 2
    '270deg 180deg 4m', // Bottom View
    '240deg 100deg 3m', // Born in UAE
    '45deg 60deg 3m', // Front view
    modelViewer.cameraOrbit
  ];

  let isTouching = false; // Tracks if the user is interacting
  let interactionTimeout = null; // Stores the timeout reference

  // Function to update the camera orbit
  function updateOrbit() {
    if (!isTouching) {
      const currentOrbitIndex = orbitCycle.indexOf(modelViewer.cameraOrbit);
      modelViewer.cameraOrbit =
        orbitCycle[(currentOrbitIndex + 1) % orbitCycle.length];
    }
  }

  modelViewer.interpolationDecay = 100;

  // Set up periodic updates
  const intervalId = setInterval(updateOrbit, 4000);

  // Handle user interaction
  modelViewer.addEventListener('pointerdown', () => {
    isTouching = true;
    clearTimeout(interactionTimeout); // Clear any previous timeout
  });

  modelViewer.addEventListener('pointerup', () => {
    // Set a delay before resuming camera movement
    interactionTimeout = setTimeout(() => {
      isTouching = false;
    }, 10000); // 10 seconds
  });

  // Annotation Line Handling
  const lines = modelViewer.querySelectorAll('line');
  const annotationButtons = {
    'about': document.querySelector('#about'),
    'flavour': document.querySelector('#flavour'),
    'effect': document.querySelector('#effect')
  };
  let baseRect, aboutRect, flavourRect, effectRect;

  function onResize() {
    const arStatus = modelViewer.getAttribute('ar-status');
    baseRect = (arStatus == "not-presenting" || arStatus == "failed") ?
      modelViewer.getBoundingClientRect() : new DOMRect();
    aboutRect = annotationButtons['about'].getBoundingClientRect();
    flavourRect = annotationButtons['flavour'].getBoundingClientRect();
    effectRect = annotationButtons['effect'].getBoundingClientRect();
  }

  window.addEventListener("resize", onResize);

  modelViewer.addEventListener('load', () => {
    onResize();

    function drawLine(svgLine, name, rect) {
      const hotspot = modelViewer.queryHotspot('hotspot-' + name);
      svgLine.setAttribute('x1', hotspot.canvasPosition.x);
      svgLine.setAttribute('y1', hotspot.canvasPosition.y);
      svgLine.setAttribute('x2', (rect.left + rect.right) / 2 - baseRect.left);
      svgLine.setAttribute('y2', rect.top - baseRect.top);
    }

    // Hide all lines initially
    lines.forEach(line => line.classList.add('hide'));

    // Function to show and auto-hide a specific line
    function showLineTemprorarily(index) {
      // Hide all lines first
      lines.forEach(line => line.classList.add('hide'));
      
      // Show the specific line
      lines[index].classList.remove('hide');

      // Auto-hide after 3 seconds
      setTimeout(() => {
        lines[index].classList.add('hide');
      }, 3000);
    }

    // Add click event listeners to buttons
    annotationButtons['about'].addEventListener('click', () => showLineTemprorarily(0));
    annotationButtons['flavour'].addEventListener('click', () => showLineTemprorarily(1));
    annotationButtons['effect'].addEventListener('click', () => showLineTemprorarily(2));

    // Use requestAnimationFrame to update with renderer
    const startSVGRenderLoop = () => {
      drawLine(lines[0], 'about', aboutRect);
      drawLine(lines[1], 'flavour', flavourRect);
      drawLine(lines[2], 'effect', effectRect);
      requestAnimationFrame(startSVGRenderLoop);
    };

    startSVGRenderLoop();
  });
});

// Create transition overlay
const transitionOverlay = document.createElement('div');
transitionOverlay.style.position = 'fixed';
transitionOverlay.style.top = '2%';
transitionOverlay.style.left = '0';
transitionOverlay.style.width = '100%';
transitionOverlay.style.height = '100%';
transitionOverlay.style.backgroundImage = "radial-gradient(circle at center, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.85))";
transitionOverlay.style.transform = 'scale(0)';
transitionOverlay.style.borderRadius = '5%';
transitionOverlay.style.zIndex = '9999';
transitionOverlay.style.transition = 'transform 1.5s ease-out';
document.body.appendChild(transitionOverlay);