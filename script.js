document.addEventListener('DOMContentLoaded', () => {
  const infoBox = document.getElementById('infoBox');
  const buttons = ['effect', 'flavour', 'about', 'buyNowBtn', 'footerButton'];
  const modelViewer = document.querySelector('#animation-demo');
  const footer = document.getElementById('footer');
  const footerButton = document.getElementById('footerButton');
  const variantBox = document.getElementById('variantBox'); // Ensure variantBox is defined if used globally

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      const modelViewer = document.querySelector('#animation-demo');
      modelViewer.pause();
      modelViewer.currentTime = 0;
      modelViewer.cameraOrbit = '75deg 60deg 105%';
      isTouching = false; // Reset isTouching if it's a global or accessible variable
      infoBox.style.display = 'none';
       buttons.forEach(btnId => {
            const btnElement = document.querySelector(`#${btnId}`);
            if (btnElement) btnElement.classList.remove('active');
        });
    }
  });

  function hideFooter() {
    footer.style.display = 'none';
    footerButton.style.bottom = '0%';
  }

  function showFooter() {
    footer.style.display = 'flex';
    footerButton.style.bottom = '12%';
  }

  footerButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (footer.style.display === 'none' || footer.style.display === '') {
      showFooter();
    } else {
      hideFooter();
    }
  });

  document.addEventListener('click', (event) => {
    if ((footer.style.display === 'flex') && 
        !footer.contains(event.target) && 
        !footerButton.contains(event.target)) {
      hideFooter();
    }
  });

  footer.style.display = 'none';

  // Store original updateInfo before potentially overwriting it
  let baseUpdateInfo = function(message) {
    const infoElement = document.getElementById('info');
    const currentInfoBox = document.getElementById('infoBox'); // Use currentInfoBox to avoid conflict
    
    infoElement.innerHTML = message;
    currentInfoBox.style.display = 'block';
  };

  // Assign to global updateInfo or use a more scoped approach if preferred
  // For simplicity here, we're preparing for updateInfo to be reassigned.
  var updateInfo = baseUpdateInfo; // 'var' to allow reassignment if this script is wrapped

  infoBox.style.display = 'none';

  function createMobileIngredientPopup() {
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
      
      const popupContainer = document.createElement('div');
      popupContainer.innerHTML = popupHTML;
      document.body.appendChild(popupContainer.firstElementChild);
      
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
          cursor: pointer; /* Add cursor pointer for mobile */
        }
      `;
      document.head.appendChild(popupStyles);
      
      document.getElementById('popup-close').addEventListener('click', () => {
        document.getElementById('mobile-ingredient-popup').classList.remove('active');
      });
    }
  }

  function createIngredientInfo() {
    const ingredientInfo = {
      'guarana': {
        title: 'Guarana',
        description: 'A plant native to the Amazon basin, known for its high caffeine content, providing sustained energy release.',
        links: [
          { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Guarana' },
          { name: 'Examine.com', url: 'https://examine.com/supplements/guarana/' },
          { name: 'PubMed Studies', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=guarana' }
        ]
      },
      'citicoline': {
        title: 'Citicoline',
        description: 'A naturally occurring brain chemical that supports memory, focus, and overall cognitive function by aiding in the synthesis of phosphatidylcholine.',
        links: [
          { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Citicoline' },
          { name: 'Examine.com', url: 'https://examine.com/supplements/citicoline/' },
          { name: 'PubMed Studies', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=citicoline+cognitive' }
        ]
      },
      'l-theanine': {
        title: 'L-Theanine',
        description: 'An amino acid found primarily in tea leaves that promotes relaxation without drowsiness, often used to smooth out caffeine\'s effects and enhance focus.',
        links: [
          { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Theanine' },
          { name: 'Examine.com', url: 'https://examine.com/supplements/theanine/' },
          { name: 'PubMed Studies', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=l-theanine+focus' }
        ]
      },
      'vitamin b6': {
        title: 'Vitamin B6 (Pyridoxine)',
        description: 'An essential vitamin crucial for brain development and function, playing a key role in neurotransmitter synthesis which impacts mood and mental clarity.',
        links: [
          { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Vitamin_B6' },
          { name: 'Examine.com', url: 'https://examine.com/supplements/vitamin-b6/' },
          { name: 'NIH Fact Sheet', url: 'https://ods.od.nih.gov/factsheets/VitaminB6-HealthProfessional/' }
        ]
      }
    };

    createMobileIngredientPopup();

    if (!document.getElementById('tooltip-styles')) {
      const tooltipStyles = document.createElement('style');
      tooltipStyles.id = 'tooltip-styles';
      tooltipStyles.textContent = `
        .ingredient-tooltip {
          position: relative;
          display: inline-block;
          font-style: italic;
          color: inherit; /* Keep original text color */
          cursor: pointer;
          border-bottom: 1px dotted #999; /* Subtle underline for desktop */
        }
        
        .tooltip-container {
          position: fixed; /* Changed from absolute to fixed */
          /* Positioning will be handled by JS */
          width: 300px;
          background-color: #fff;
          color: #333;
          text-align: left;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          z-index: 1000;
          display: none; /* Initially hidden */
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

    if (!document.getElementById('tooltip-container')) {
      const tooltipContainer = document.createElement('div');
      tooltipContainer.id = 'tooltip-container';
      tooltipContainer.className = 'tooltip-container';
      document.body.appendChild(tooltipContainer);
    }
    
    // Re-assign updateInfo to the enhanced version
    updateInfo = function(message) {
      baseUpdateInfo(message); // Call the original function first
      
      const infoElement = document.getElementById('info');
      const currentInfoBox = document.getElementById('infoBox'); // Local reference to infoBox
      const isMobile = window.innerWidth < 1025;
      
      Object.keys(ingredientInfo).forEach(ingredientKey => {
        // Regex to match whole word, case insensitive, and handle spaces in keys
        const regexPattern = ingredientKey.replace(/ /g, '\\s+'); // Allows one or more spaces between words
        const regex = new RegExp(`\\b(${regexPattern})\\b`, 'gi'); // 'g' for global, 'i' for case-insensitive

        infoElement.innerHTML = infoElement.innerHTML.replace(regex, (match) => {
            // 'match' here is the actual text found, e.g., "Guarana", "citicoline", "Vitamin B6"
            // We use 'ingredientKey' for data-attribute to ensure consistency with 'ingredientInfo' keys.
            if (isMobile) {
                return `<span class="mobile-ingredient" data-ingredient="${ingredientKey.toLowerCase()}">${match}</span>`;
            } else {
                return `<span class="ingredient-tooltip" data-ingredient="${ingredientKey.toLowerCase()}">${match}</span>`;
            }
        });
      });
      
      if (isMobile) {
        const mobileIngredients = document.querySelectorAll('.mobile-ingredient');
        const popup = document.getElementById('mobile-ingredient-popup');
        const popupTitle = document.getElementById('popup-title');
        const popupDescription = document.getElementById('popup-description');
        const popupLinks = document.getElementById('popup-links');
        
        mobileIngredients.forEach(ingredientSpan => {
          ingredientSpan.addEventListener('click', () => {
            const ingredientName = ingredientSpan.getAttribute('data-ingredient');
            const info = ingredientInfo[ingredientName]; // ingredientInfo keys are lowercase
            
            if (info) {
                popupTitle.textContent = info.title;
                popupDescription.textContent = info.description;
                popupLinks.innerHTML = info.links.map(link => 
                `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a>`
                ).join(' ');
                popup.classList.add('active');
            }
          });
        });
      } else {
        const tooltips = document.querySelectorAll('.ingredient-tooltip');
        const tooltipContainer = document.getElementById('tooltip-container');
        
        tooltips.forEach(tooltip => {
          tooltip.addEventListener('mouseenter', (event) => {
            const ingredientKey = tooltip.getAttribute('data-ingredient');
            const info = ingredientInfo[ingredientKey]; // ingredientInfo keys are lowercase
            
            if (info) {
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
                
                const infoBoxRect = currentInfoBox.getBoundingClientRect();
                tooltipContainer.style.left = (infoBoxRect.right + 20) + 'px';
                tooltipContainer.style.top = (infoBoxRect.top + infoBoxRect.height / 2) + 'px';
                tooltipContainer.style.transform = 'translateY(-50%)';
                
                const tooltipRect = tooltipContainer.getBoundingClientRect();
                if (tooltipRect.right > window.innerWidth - 20) { // Check with a margin
                    tooltipContainer.style.left = (infoBoxRect.left - tooltipRect.width - 20) + 'px';
                }
                 if (tooltipRect.left < 20) { // Ensure it's not off-screen left
                    tooltipContainer.style.left = '20px';
                }
                 if (tooltipRect.bottom > window.innerHeight - 20) {
                    tooltipContainer.style.top = (window.innerHeight - tooltipRect.height - 20) + 'px';
                    tooltipContainer.style.transform = 'translateY(0)';
                }
                if (tooltipRect.top < 20) {
                    tooltipContainer.style.top = '20px';
                    tooltipContainer.style.transform = 'translateY(0)';
                }
            }
          });
          
          tooltip.addEventListener('mouseleave', () => {
            setTimeout(() => {
              if (!tooltipContainer.matches(':hover')) {
                tooltipContainer.style.display = 'none';
              }
            }, 800);
          });
        });
        
        tooltipContainer.addEventListener('mouseleave', () => {
          tooltipContainer.style.display = 'none';
        });
      }
    };
  }
  
  createIngredientInfo(); // This will redefine `updateInfo`

  buttons.forEach(buttonId => {
    const buttonElement = document.querySelector(`#${buttonId}`);
    if (!buttonElement) return; // Skip if button doesn't exist

    buttonElement.addEventListener('click', () => {
      // Add 'active' class to clicked button and remove from others
      buttons.forEach(btnId => {
        const btnElement = document.querySelector(`#${btnId}`);
        if (btnElement) { // Check if element exists
            if (btnId === buttonId && btnId !== 'buyNowBtn' && btnId !== 'footerButton') {
                btnElement.classList.add('active');
            } else {
                btnElement.classList.remove('active');
            }
        }
      });

      switch(buttonId) {
        case 'effect':
          modelViewer.cameraOrbit = '130deg 90deg 3m';
          if (variantBox) variantBox.style.display = 'none';
          if (window.innerWidth >= 1025) {
            updateInfo('Energy, memory, focus. <br>Caffeine from Guarana, <br>with nootropics including <br> Citicoline, <br> L-Theanine, <br> Vitamin B6. <br><br>Our blend supports mental clarity, reduces fatigue, & enhances brain function.');
          } else {
            updateInfo('Energy, memory, focus. Caffeine from Guarana, with nootropics including Citicoline, L-Theanine, and Vitamin B6.');
          }
          break;

        case 'flavour':
          modelViewer.cameraOrbit = '90deg 0deg 3m';
          if (variantBox) variantBox.style.display = 'block';
          if (window.innerWidth >= 1025) {
            updateInfo('Available in Cool Mint and Blueberry. Optimized for potency and flavor duration. <br><br>Stay tuned as we increase our range of flavours.');
          } else {
            updateInfo('Available in Cool Mint and Blueberry. Optimized for potency and flavor duration.');
          }
          break;

        case 'about':
          modelViewer.cameraOrbit = '270deg 180deg 4m';
          if (variantBox) variantBox.style.display = 'none';
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
          setTimeout(() => {
            window.location.href = '../checkout';
          }, 1200);
          break;
      }
    });
  });

  window.addEventListener('resize', () => {
    // If infoBox is visible, re-trigger the active button's click to re-render content
    if (infoBox.style.display === 'block') {
      const activeButton = buttons.find(btnId => {
        const el = document.querySelector(`#${btnId}`);
        return el && el.classList.contains('active');
      });
      if (activeButton) {
        const activeElement = document.querySelector(`#${activeButton}`);
        if (activeElement) activeElement.click();
      }
    }
    
    const popup = document.getElementById('mobile-ingredient-popup');
    if (popup) {
      popup.classList.remove('active');
    }
  });
  
  document.addEventListener('click', (event) => {
    const currentInfoBox = document.getElementById('infoBox'); // Use local reference

    // Check if the click is outside the infoBox and not on any of the control buttons
    if (currentInfoBox.style.display === 'block' && // Only if infoBox is visible
        !currentInfoBox.contains(event.target) && 
        !buttons.some(buttonId => {
            const btnEl = document.querySelector(`#${buttonId}`);
            return btnEl && btnEl.contains(event.target); // Check if button exists and contains target
        })) {
      currentInfoBox.style.display = 'none';
      // Remove 'active' class from all buttons when infoBox is closed this way
      buttons.forEach(btnId => {
          const btnElement = document.querySelector(`#${btnId}`);
          if (btnElement) btnElement.classList.remove('active');
      });
      const tooltipContainer = document.getElementById('tooltip-container');
      if (tooltipContainer) {
        tooltipContainer.style.display = 'none';
      }
    }
  });

  const orbitCycle = [
    '90deg 0deg 3m',
    '0deg 0deg 3m',
    '0deg 90deg 3m',
    '120deg 90deg 3m',
    '270deg 180deg 4m',
    '240deg 100deg 3m',
    '45deg 60deg 3m',
    modelViewer.cameraOrbit // Initial orbit
  ];

  let isTouching = false;
  let interactionTimeout = null;

  function updateOrbit() {
    if (!isTouching && (infoBox.style.display === 'none' || infoBox.style.display === '')) {
      const currentOrbitIndex = orbitCycle.indexOf(modelViewer.cameraOrbit);
      const nextOrbitIndex = (currentOrbitIndex + 1) % orbitCycle.length;
      // Ensure the next orbit is different from current, especially if initial orbit was duplicated
      if (orbitCycle[nextOrbitIndex] !== modelViewer.cameraOrbit || orbitCycle.length === 1) {
          modelViewer.cameraOrbit = orbitCycle[nextOrbitIndex];
      } else {
          modelViewer.cameraOrbit = orbitCycle[(nextOrbitIndex + 1) % orbitCycle.length];
      }
    }
  }

  modelViewer.interpolationDecay = 100;
  const intervalId = setInterval(updateOrbit, 4000);

  modelViewer.addEventListener('pointerdown', () => {
    isTouching = true;
    clearTimeout(interactionTimeout);
  });

  modelViewer.addEventListener('pointerup', () => {
    interactionTimeout = setTimeout(() => {
      isTouching = false;
    }, 10000); // 10 seconds
  });
});