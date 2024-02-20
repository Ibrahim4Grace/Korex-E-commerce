
document.addEventListener("DOMContentLoaded", function() {
// Function to display the popup advertisement
function advertisementPopup() {
    let popup = document.getElementById("popup");
    if (popup) {
        popup.style.display = "block";
        setTimeout(function() {
            popup.style.transform = "translate(-50%, -50%) scale(1)"; // Zoom in
        }, 50); // Delay to ensure smooth transition
    }
}

// Set timeout to display popup after 3 minutes (180000 milliseconds)
setTimeout(advertisementPopup, 6000);
});

// Function to close the popup
function closePopup() {
    let popup = document.getElementById("popup");
    if (popup) {
        popup.style.transform = "translate(-50%, -50%) scale(0)"; // Zoom out
        setTimeout(function() {
            popup.style.display = "none";
        }, 300); // Delay to ensure smooth transition
    }
}
