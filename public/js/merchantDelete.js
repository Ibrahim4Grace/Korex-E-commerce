document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default behavior of anchor tag
        
        const productId = this.getAttribute('data-product-id');
        fetch(`/merchant/deleteProduct/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Handle success response
                window.location.href = "/merchant/products";
                showToast('Product deleted successfully', 'success');
            } else {
                // Handle error response
                throw new Error('Network response was not ok.');
            }
        })
        .catch(error => {
            console.error('Error deleting product:', error.message);
            // Handle network or server error if needed
        });
    });
});
