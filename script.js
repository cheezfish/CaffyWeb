document.querySelector('#effect').addEventListener('click', () => {
    const modelViewer = document.querySelector('#animation-demo');
    
    // Rotate further to the left view (adjusted for more side angle)
    modelViewer.cameraOrbit = '130deg 90deg 3m'; // Move further left (adjust the angle for a more side view)
  
    // Remove any active state or styling from the button
    const effectButton = document.querySelector('#effect');
    effectButton.classList.remove('active'); // Remove 'active' class if it's added
    
    // Optionally, reset the button's appearance
    effectButton.style.backgroundColor = ''; // Reset background color if changed
  });
  
  
  
  document.querySelector('#flavour').addEventListener('click', () => {
    const modelViewer = document.querySelector('#animation-demo');
    modelViewer.cameraOrbit = '90deg 0deg 3m'; // Set the camera to the top view
  
    // Remove any active state or styling from the button
    const flavourButton = document.querySelector('#flavour');
    flavourButton.classList.remove('active'); // Remove 'active' class if it's added
    
    // Optionally, reset the button's appearance
    flavourButton.style.backgroundColor = ''; // Reset background color if changed
  });
  
  document.querySelector('#about').addEventListener('click', () => {
    const modelViewer = document.querySelector('#animation-demo');
    modelViewer.cameraOrbit = '270deg 180deg 4m'; // Set the camera to the bottom view
  
    // Remove any active state or styling from the button
    const aboutButton = document.querySelector('#about');
    aboutButton.classList.remove('active'); // Remove 'active' class if it's added
    
    // Optionally, reset the button's appearance
    aboutButton.style.backgroundColor = ''; // Reset background color if changed
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
