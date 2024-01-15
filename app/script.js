document.addEventListener('DOMContentLoaded', () => {
    fetchProductTypes();
    fetchProductTypesMenu();
});

const submitButton = document.getElementById('submit-btn');
const productTypeSelection = document.getElementById('product-type');
const productNameSelection = document.getElementById('product-name');
const quantityValue = document.getElementById('quantity');

async function fetchProductTypesMenu() {
    const productTypeDropdown = document.getElementById('product-type');
    const response = await fetch(`product_types`);
    const productTypes = await response.json();

    productTypeDropdown.innerHTML = '<option value="" disabled selected hidden>Select Product Type</option>';

    productTypes.forEach(productType => {
        const option = document.createElement('option');
        option.value = productType.type_name;
        option.textContent = productType.type_name;
        productTypeDropdown.appendChild(option);
    });

    productTypeDropdown.addEventListener('change', () => {
        const selectedProductType = productTypeDropdown.value;
        if (selectedProductType) {
            fetchProductsMenu(selectedProductType);
        } else {
            disableDropdown('product-name');
            disableDropdown('product-size');
            disableInput('quantity');
            disableButton('submit-btn');
        }
    });

}


async function fetchProductsMenu(productType) {
    const productNameDropdown = document.getElementById('product-name');
    const response = await fetch(`product_names/${productType}`);
    const products = await response.json();


    productNameDropdown.innerHTML = '<option value="" disabled selected hidden>Select Product Name</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.product_name;
        option.textContent = product.product_name;
        productNameDropdown.appendChild(option);
    });

    productNameDropdown.addEventListener('change', () => {
        const selectedProductName = productNameDropdown.value;
        if (selectedProductName) {
            enable('quantity');
            enable('submit-btn');
        } else {
            disableInput('quantity');
            disableButton('submit-btn');
        }
    });

}

function enable(id) {
    const inputElement = document.getElementById(id);
    if (inputElement) {
        inputElement.removeAttribute('disabled');
    }
}

submitButton.addEventListener('click', () => {

    const pType = productTypeSelection.value;
    const pName = productNameSelection.value;
    const qvalue = quantityValue.value;
    
    const response = fetch(`updateStock/${pType}/${pName}/${qvalue}`, {
        method: "PUT",
    });
    
    });


async function fetchProductTypes() {
    const productTypesList = document.getElementById('product-types-list');
    const response = await fetch(`product_types`);
    const productTypes = await response.json();


    productTypes.forEach(productType => {
        const listItem = document.createElement('li');
        listItem.textContent = productType.type_name;
        listItem.classList.add('product-type');
        listItem.addEventListener('click', () => fetchProducts(productType.type_name));
        productTypesList.appendChild(listItem);
    });
}




async function fetchProducts(productType) {
    const productsContainer = document.getElementById('products-container');
    const response = await fetch(`product_names/${productType}`);
    const products = await response.json();



    products.forEach(product => {
        const productItem = createProductItem(productType, product);
        productsContainer.appendChild(productItem);
    });
}

function createProductItem(productType, product) {
    const productItem = document.createElement('div');
    productItem.classList.add('product-item');

    const productDetails = document.createElement('div');
    productDetails.classList.add('product-details');

    const productImage = document.createElement('img');
    productImage.src = 'https://via.placeholder.com/100';  // Replace with your actual image URL
    productImage.alt = 'Product Image';
    productImage.classList.add('product-image');
    productDetails.appendChild(productImage);

    const productInfo = document.createElement('div');
    const productName = document.createElement('p');
    productName.textContent = product.product_name;
    const productSize = document.createElement('p');
    productSize.textContent = product.product_size;
    productInfo.appendChild(productName);
    productInfo.appendChild(productSize);
    productDetails.appendChild(productInfo);

    const productQuantity = document.createElement('div');
    productQuantity.textContent = product.quantity;
    productQuantity.classList.add('product-quantity');
    productQuantity.id = `product-quantity-${product.product_name}`;

    const productButtons = document.createElement('div');
    productButtons.classList.add('product-buttons');

    const incrementButton = createButton('+', () => updateQuantity(productType, product.product_name, 1));
    const decrementButton = createButton('-', () => updateQuantity(productType, product.product_name, -1));

    productButtons.appendChild(decrementButton);
    productButtons.appendChild(productQuantity);
    productButtons.appendChild(incrementButton);

    productItem.appendChild(productDetails);
    productItem.appendChild(productButtons);

    return productItem;
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

async function updateQuantity(productType, productName, delta) {
    try {
        const response = await fetch(`updateStock/${productType}/${productName}/${delta}`, { method: 'PUT' });
        if (response.ok) {
            // Update the displayed count without reloading the entire page
            const productQuantityElement = document.getElementById(`product-quantity-${productName}`);
            const currentQuantity = parseInt(productQuantityElement.textContent);
            const newQuantity = currentQuantity + delta;
            productQuantityElement.textContent = newQuantity;
        } else {
            console.error('Failed to update quantity.');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}




