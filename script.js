document.addEventListener('DOMContentLoaded', () => {
  const infoBox = document.getElementById('infoBox');
  const buttons = ['effect', 'flavour', 'about', 'buyNowBtn', 'footerButton'];
  const modelViewer = document.querySelector('#animation-demo');
  const footer = document.getElementById('footer');
  const footerButton = document.getElementById('footerButton');

  // Add this near the top of your DOMContentLoaded event handler
  window.addEventListener('pageshow', (event) => {
    // Check if the page is being restored from the bfcache (back/forward cache)
    if (event.persisted) {
      // Reset the model to its initial state
      const modelViewer = document.querySelector('#animation-demo');
      
      // Stop any current animation
      modelViewer.pause();
      
      // Reset animation to initial frame
      modelViewer.currentTime = 0;
      
      // Reset camera position to default view
      modelViewer.cameraOrbit = '75deg 60deg 105%';
      
      // Reset any other state as needed
      isTouching = false;
      infoBox.style.display = 'none';
    }
  });

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

  // Create mobile ingredient popup
  function createMobileIngredientPopup() {
    // Create mobile popup if it doesn't exist
    if (!document.getElementById('mobile-ingredient-popup')) {
      const popupHTML = `
        <div id="mobile-ingredient-popup" class="mobile-ingredient-popup">
          <div class="popup-content">
            <button id="popup-close" class="popup-close-x">×</button>
            <h3 id="popup-title">Ingredient</h3>
            <p id="popup-description"></p>
            <div id="popup-links" class="popup-links"></div>
          </div>
        </div>
      `;
      
      // Add popup to the body
      const popupContainer = document.createElement('div');
      popupContainer.innerHTML = popupHTML;
      document.body.appendChild(popupContainer.firstElementChild);
      
      // Add styles for the popup
      const popupStyles = document.createElement('style');
      popupStyles.id = 'mobile-popup-styles';
      popupStyles.textContent = `
        .mobile-ingredient-popup {
          display: none;
          position: fixed;
          left: 0;
          bottom: 0;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.95);
          color: #fff;
          z-index: 1000;
          border-top-left-radius: 15px;
          border-top-right-radius: 15px;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.5);
          transition: transform 0.3s ease-in-out;
          transform: translateY(100%);
        }
        
        .mobile-ingredient-popup.active {
          display: block;
          transform: translateY(0);
        }
        
        .popup-content {
          padding: 20px;
          text-align: center;
          position: relative;
        }
        
        .popup-content h3 {
          margin-top: 0;
          color: #5ee6e6;
          font-size: 18px;
        }
        
        .popup-content p {
          margin-bottom: 15px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .popup-links {
          margin-bottom: 30px;
        }
        
        .popup-links a {
          display: inline-block;
          margin: 5px;
          padding: 5px 10px;
          background-color: #333;
          color: #5ee6e6;
          text-decoration: none;
          border-radius: 15px;
          font-size: 12px;
        }
        
        .popup-close-x {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: #5ee6e6;
          color: #000;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-size: 16px;
          line-height: 1;
          font-weight: bold;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .mobile-ingredient {
          font-style: italic;
          color: #5ee6e6;
          text-decoration: underline;
        }
      `;
      document.head.appendChild(popupStyles);
      
      // Add close button functionality
      document.getElementById('popup-close').addEventListener('click', () => {
        document.getElementById('mobile-ingredient-popup').classList.remove('active');
      });
    }
  }

  // Function to create ingredient tooltips/popups based on device
  function createIngredientInfo() {
    // Define ingredient information with links
    const ingredientInfo = {
      'guarana': {
        title: 'Guarana',
        description: 'A plant native to the Amazon basin, known for its high caffeine content.',
        links: [
          { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Guarana' },
          { name: 'Examine.com', url: 'https://examine.com/supplements/guarana/' },
          { name: 'PubMed Studies', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=guarana' }
        ]
      },
      'taurine': {
        title: 'Taurine',
        description: 'An amino acid that supports neurological development and regulates water and mineral salt levels in the blood.',
        links: [
          { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Taurine' },
          { name: 'Examine.com', url: 'https://examine.com/supplements/taurine/' },
          { name: 'NIH Info', url: 'https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/' }
        ]
      },
      'l-theanine': {
        title: 'L-Theanine',
        description: 'An amino acid found primarily in tea leaves that promotes relaxation without drowsiness.',
        links: [
          { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Theanine' },
          { name: 'Examine.com', url: 'https://examine.com/supplements/theanine/' },
          { name: 'PubMed Studies', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=l-theanine' }
        ]
      },
      'alpha-gpc': {
        title: 'Alpha-GPC',
        description: 'A choline-containing compound that may increase acetylcholine in the brain, supporting cognitive function.',
        links: [
          { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Alpha-GPC' },
          { name: 'Examine.com', url: 'https://examine.com/supplements/alpha-gpc/' },
          { name: 'NCBI Research', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4594115/' }
        ]
      },
      'rhodiola rosea': {
        title: 'Rhodiola Rosea',
        description: 'An adaptogenic herb that may help the body resist physical and mental stress.',
        links: [
          { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Rhodiola_rosea' },
          { name: 'Examine.com', url: 'https://examine.com/supplements/rhodiola-rosea/' },
          { name: 'NCCIH Info', url: 'https://www.nccih.nih.gov/health/rhodiola' }
        ]
      }
    };

    // Create mobile popup
    createMobileIngredientPopup();

    // Create desktop tooltips
    if (!document.getElementById('tooltip-styles')) {
      const tooltipStyles = document.createElement('style');
      tooltipStyles.id = 'tooltip-styles';
      tooltipStyles.textContent = `
        .ingredient-tooltip {
          position: relative;
          display: inline-block;
          font-style: italic;
          color: inherit;
          cursor: pointer;
          border-bottom: 1px dotted #999;
        }
        
        .tooltip-container {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          width: 300px;
          background-color: #fff;
          color: #333;
          text-align: left;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          z-index: 1000;
          display: none;
        }
        
        .tooltip-links {
          margin-top: 8px;
          font-size: 12px;
        }
        
        .tooltip-links a {
          color: #666;
          text-decoration: none;
          margin-right: 8px;
        }
        
        .tooltip-links a:hover {
          text-decoration: underline;
        }
      `;
      document.head.appendChild(tooltipStyles);
    }

    // Create a single tooltip container if it doesn't exist
    if (!document.getElementById('tooltip-container')) {
      const tooltipContainer = document.createElement('div');
      tooltipContainer.id = 'tooltip-container';
      tooltipContainer.className = 'tooltip-container';
      document.body.appendChild(tooltipContainer);
    }

    // Override updateInfo to add tooltips/mobile popup functionality
    const originalUpdateInfo = updateInfo;
    
    updateInfo = function(message) {
      // Call the original function first
      originalUpdateInfo(message);
      
      // Get the info element after it's been updated
      const infoElement = document.getElementById('info');
      
      // For desktop: tooltips
      // For mobile: clickable text that opens bottom popup
      const isMobile = window.innerWidth < 1025;
      
      // Replace ingredient names with tooltipped spans or mobile clickable spans
      Object.keys(ingredientInfo).forEach(ingredient => {
        // Case insensitive search for ingredient name
        const regex = new RegExp(`\\b${ingredient}\\b`, 'i');
        if (infoElement.innerHTML.match(regex)) {
          if (isMobile) {
            // Mobile: Add clickable class
            infoElement.innerHTML = infoElement.innerHTML.replace(
              regex,
              `<span class="mobile-ingredient" data-ingredient="${ingredient}">${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}</span>`
            );
          } else {
            // Desktop: Add tooltip class
            infoElement.innerHTML = infoElement.innerHTML.replace(
              regex,
              `<span class="ingredient-tooltip" data-ingredient="${ingredient}">${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}</span>`
            );
          }
        }
      });
      
      if (isMobile) {
        // Setup mobile click events
        const mobileIngredients = document.querySelectorAll('.mobile-ingredient');
        const popup = document.getElementById('mobile-ingredient-popup');
        const popupTitle = document.getElementById('popup-title');
        const popupDescription = document.getElementById('popup-description');
        const popupLinks = document.getElementById('popup-links');
        
        mobileIngredients.forEach(ingredient => {
          ingredient.addEventListener('click', () => {
            const ingredientName = ingredient.getAttribute('data-ingredient');
            const info = ingredientInfo[ingredientName];
            
            popupTitle.textContent = info.title;
            popupDescription.textContent = info.description;
            
            // Generate links
            popupLinks.innerHTML = info.links.map(link => 
              `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a>`
            ).join(' ');
            
            // Show popup
            popup.classList.add('active');
          });
        });
      } else {
        // Setup desktop tooltip hover events
        const tooltips = document.querySelectorAll('.ingredient-tooltip');
        const tooltipContainer = document.getElementById('tooltip-container');
        
        tooltips.forEach(tooltip => {
          tooltip.addEventListener('mouseenter', () => {
            const ingredient = tooltip.getAttribute('data-ingredient');
            const info = ingredientInfo[ingredient];
            
            tooltipContainer.innerHTML = `
              <strong>${info.title}</strong>
              <p>${info.description}</p>
              <div class="tooltip-links">
                ${info.links.map(link => 
                  `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a>`
                ).join(' ')}
              </div>
            `;
            
            tooltipContainer.style.display = 'block';
            
            // Calculate position to appear to the right of the infoBox
            const infoBoxRect = infoBox.getBoundingClientRect();
            tooltipContainer.style.left = (infoBoxRect.right + 20) + 'px';
            tooltipContainer.style.right = 'auto';
            tooltipContainer.style.top = (infoBoxRect.top + infoBoxRect.height / 2) + 'px';
            tooltipContainer.style.transform = 'translateY(-50%)';
            
            // Check if tooltip would go off-screen and adjust if needed
            const tooltipRect = tooltipContainer.getBoundingClientRect();
            if (tooltipRect.right > window.innerWidth) {
              tooltipContainer.style.left = 'auto';
              tooltipContainer.style.right = '20px';
            }
          });
          
          tooltip.addEventListener('mouseleave', () => {
            // Hide tooltip after a small delay to prevent flickering
            setTimeout(() => {
              if (!tooltipContainer.matches(':hover')) {
                tooltipContainer.style.display = 'none';
              }
            }, 100);
          });
        });
        
        // Hide tooltip when mouse leaves it
        tooltipContainer.addEventListener('mouseleave', () => {
          tooltipContainer.style.display = 'none';
        });
      }
    };
  }
  
  // Initialize the ingredient info functionality
  createIngredientInfo();

  // Click event for each button
  buttons.forEach(buttonId => {
    document.querySelector(`#${buttonId}`).addEventListener('click', () => {
      switch(buttonId) {
        case 'effect':
          modelViewer.cameraOrbit = '130deg 90deg 3m';
          if (typeof variantBox !== 'undefined') {
            variantBox.style.display = 'none';
          }
          if (window.innerWidth >= 1025) {
            updateInfo('Energy, memory, focus. <br>Caffeine from guarana, <br>with nootropics including <br> Taurine, <br> L-Theanine, <br> Alpha-GPC, <br> Rhodiola Rosea. <br><br>Our blend supports mental clarity, reduces fatigue, & enhances brain function.');
          } else {
            updateInfo('Energy, memory, focus. Caffeine from guarana, with nootropics including Taurine, L-Theanine, Alpha-GPC, and Rhodiola Rosea.');
          }
          break;

        case 'flavour':
          modelViewer.cameraOrbit = '90deg 0deg 3m';
          if (typeof variantBox !== 'undefined') {
            variantBox.style.display = 'block';
          }
          if (window.innerWidth >= 1025) {
            updateInfo('Available in Cool Mint and Blueberry. Optimized for potency and flavor duration. <br><br>Stay tuned as we increase our range of flavours.');
          } else {
            updateInfo('Available in Cool Mint and Blueberry. Optimized for potency and flavor duration.');
          }
          break;

        case 'about':
          modelViewer.cameraOrbit = '270deg 180deg 4m';
          if (typeof variantBox !== 'undefined') {
            variantBox.style.display = 'none';
          }
          if (window.innerWidth >= 1025) {
            updateInfo('CAFFY is the product of a mission to create the perfect blend of nootropic supplements. <br><br>Our aim is to reimagine the way we utilise caffeine, and deliver you positive tangible effects with complete transparency.');
          } else {
            updateInfo('CAFFY is the product of a mission to create the perfect blend of nootropic supplements. Our aim is to reimagine the way we utilise caffeine.');
          }
          break;

        case 'buyNowBtn':
          modelViewer.play({ repetitions: 1 });
          modelViewer.cameraOrbit = '90deg 65deg 4m';
          isTouching = true;

          // Redirect after transition
          setTimeout(() => {
            window.location.href = '/checkout';
          }, 1200); // matches transition duration
            
          break;
      }
    });
  });

  // Add window resize event to recreate content if needed
  window.addEventListener('resize', () => {
    if (document.getElementById('infoBox').style.display === 'block') {
      const effectButton = document.getElementById('effect');
      const flavourButton = document.getElementById('flavour');
      const aboutButton = document.getElementById('about');
      
      // Determine which button is active and re-click it to refresh content
      if (effectButton.classList.contains('active')) {
        effectButton.click();
      } else if (flavourButton.classList.contains('active')) {
        flavourButton.click();
      } else if (aboutButton.classList.contains('active')) {
        aboutButton.click();
      }
    }
    
    // Hide mobile popup on resize
    const popup = document.getElementById('mobile-ingredient-popup');
    if (popup) {
      popup.classList.remove('active');
    }
  });
  
  // Close infoBox if clicked outside
  document.addEventListener('click', (event) => {
    if (!infoBox.contains(event.target) && 
        !buttons.some(buttonId => document.querySelector(`#${buttonId}`).contains(event.target))) {
      infoBox.style.display = 'none';
      // Also hide tooltip container
      const tooltipContainer = document.getElementById('tooltip-container');
      if (tooltipContainer) {
        tooltipContainer.style.display = 'none';
      }
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
});