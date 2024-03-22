
    // Function to handle the click event of the delete button
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            
            // Send AJAX request to delete the product
            fetch(`/merchant/deleteProduct/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Include authorization token if needed
                    // 'Authorization': 'Bearer <your_token>'
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json(); // Parse JSON response
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                // Handle success response
                if (data.success) {
                    // Redirect to product.ejs page or any other suitable route
                    window.location.href = "/merchant/products";
                } else {
                    console.error('Delete request failed:', data.errors[0].msg);
                    // Handle error response if needed
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error.message);
                // Handle network or server error if needed
            });
        });
    });

