document.addEventListener('DOMContentLoaded', () => {
    
    const products = [
        {
            id: 1,
            name: "Vodka Ignite",
            price: 80.00,
            images: ["assets/vodka1.jpg", "assets/vodka2.jpeg", "assets/vodka3.jpg", "assets/vodka4.jpg"],
            shortDescription: "Uma vodka ultra premium, destilada para pureza e suavidade excepcionais.",
            longDescription: "A Vodka Ignite redefine o padrão de luxo. Produzida a partir dos melhores grãos e água puríssima, passa por um processo de múltipla destilação que garante um sabor incrivelmente suave e um acabamento limpo. Perfeita para ser apreciada pura ou em coquetéis sofisticados.",
            details: ["Tipo: Vodka Ultra Premium", "Volume: 750ml", "Teor Alcoólico: 40%", "Origem: Produzida com ingredientes selecionados"],
        },
        {
            id: 2,
            name: "Gin Ignite",
            price: 85.00,
            images: ["assets/gin1.jpg", "assets/gin2.jpg", "assets/gin3.jpg", "assets/gin4.jpg"],
            shortDescription: "Um gin artesanal com uma infusão botânica única para um sabor vibrante.",
            longDescription: "O Gin Ignite é uma celebração de sabores. Criado com uma seleção cuidadosa de botânicos exóticos e zimbro de alta qualidade, este gin oferece um perfil aromático complexo e refrescante. Ideal para um gin tônica clássico ou para explorar novas criações de coquetelaria.",
            details: ["Tipo: London Dry Gin", "Volume: 750ml", "Teor Alcoólico: 43%", "Botânicos: Zimbro, coentro, notas cítricas e especiarias"],
        },
    ];
    
    let cart = [];
    const appRoot = document.getElementById('app-root');
    // ATENÇÃO: Mude esta URL para a URL do seu back-end no Render quando publicar
    const backendUrl = 'http://localhost:3000'; 

    const saveCart = () => localStorage.setItem('shoppingCart', JSON.stringify(cart));
    const loadCart = () => {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) cart = JSON.parse(savedCart);
    };

    const renderPage = (pageName) => {
        appRoot.innerHTML = '';
        renderHeader(pageName);
        if (pageName === 'home') renderHomePage();
        else if (pageName === 'products') renderProductsPage();
        renderFooter();
        updateCartIcon();
    };

    const renderHeader = (activePage) => {
        const header = document.createElement('header');
        header.className = 'header';
        header.innerHTML = `
            <div class="nav-pill">
                <div class="header-logo">
                    <ion-icon name="bag-handle"></ion-icon>
                    <span>S&D</span>
                </div>
                <nav>
                    <a href="#" class="nav-link ${activePage === 'home' ? 'active' : ''}" data-page="home">Home</a>
                    <a href="#" class="nav-link ${activePage === 'products' ? 'active' : ''}" data-page="products">Produtos</a>
                </nav>
                <div class="cart-icon-wrapper">
                    <ion-icon name="cart-outline" class="cart-icon"></ion-icon>
                    <span class="cart-badge">0</span>
                </div>
            </div>
        `;
        appRoot.appendChild(header);
    };

    const renderHomePage = () => { /* ...código da home page inalterado... */ };
    const renderProductsPage = () => { /* ...código da pág de produtos inalterado... */ };
    const renderFooter = () => { /* ...código do rodapé inalterado... */ };

    const updateCartIcon = () => {
        const badge = document.querySelector('.cart-badge');
        if (!badge) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.classList.toggle('visible', totalItems > 0);
    };

    const addToCart = (productId) => {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, quantity: 1 });
        }
        const cartIconWrapper = document.querySelector('.cart-icon-wrapper');
        if (cartIconWrapper) {
            cartIconWrapper.classList.add('shaking');
            setTimeout(() => cartIconWrapper.classList.remove('shaking'), 800);
        }
        saveCart();
        updateCartView();
    };
    
    const updateQuantity = (productId, newQuantity) => {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            if (newQuantity <= 0) {
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].quantity = newQuantity;
            }
            saveCart();
            updateCartView();
        }
    };

    const updateCartView = () => {
        const cartBody = document.querySelector('.cart-body');
        const cartFooter = document.querySelector('.cart-footer');
        if (!cartBody || !cartFooter) return;

        updateCartIcon();

        if (cart.length === 0) {
            cartBody.innerHTML = `<p class="cart-empty-message">Seu carrinho está vazio.</p>`;
            cartFooter.style.display = 'none';
        } else {
            cartBody.innerHTML = cart.map(item => {
                const product = products.find(p => p.id === item.id);
                return `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${product.images[0]}" alt="${product.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <p class="cart-item-title">${product.name}</p>
                        <p class="cart-item-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <button class="quantity-btn decrease-qty">-</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="quantity-btn increase-qty">+</button>
                            </div>
                            <button class="remove-item-btn"><ion-icon name="trash-outline"></ion-icon></button>
                        </div>
                    </div>
                </div>`;
            }).join('');

            const subtotal = cart.reduce((sum, item) => {
                const product = products.find(p => p.id === item.id);
                return sum + (product.price * item.quantity);
            }, 0);

            cartFooter.style.display = 'block';
            cartFooter.innerHTML = `
                <div class="cart-subtotal">
                    <span>Subtotal</span>
                    <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="shipping-calc">
                    <input type="text" id="cep-input" placeholder="Digite seu CEP">
                    <button class="button" id="checkout-btn">Finalizar Compra</button>
                </div>
                <div id="shipping-result"></div>
            `;
        }
    };
    
    const createCartShell = () => { /* ...código inalterado... */ };
    const toggleCart = (show) => { /* ...código inalterado... */ };
    const openProductModal = (productId) => { /* ...código inalterado... */ };

    const handleCheckout = async () => {
        const cepInput = document.getElementById('cep-input');
        const checkoutBtn = document.getElementById('checkout-btn');
        const shippingResult = document.getElementById('shipping-result');

        const cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (cep.length !== 8) {
            shippingResult.textContent = 'Por favor, digite um CEP válido.';
            shippingResult.style.color = 'red';
            return;
        }

        checkoutBtn.textContent = 'Calculando...';
        checkoutBtn.disabled = true;
        shippingResult.textContent = '';

        try {
            const response = await fetch(`${backendUrl}/calcular-frete-e-pagamento`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart, cepDestino: cep })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || 'Erro ao calcular o frete.');
            }
            
            // Redireciona para o link de pagamento
            window.location.href = data.paymentLink;

        } catch (error) {
            shippingResult.textContent = `Erro: ${error.message}`;
            shippingResult.style.color = 'red';
            checkoutBtn.textContent = 'Finalizar Compra';
            checkoutBtn.disabled = false;
        }
    };

    const initializeEventListeners = () => {
        document.body.addEventListener('click', function(event) {
            // ... (outros listeners como navLink, detailsButton, etc.)

            // Botão de Finalizar Compra
            if (event.target.id === 'checkout-btn') {
                handleCheckout();
                return;
            }
            
            // ... (resto dos listeners)
        });
    };

    // Inicialização
    loadCart();
    createCartShell();
    renderPage('home');
    initializeEventListeners();
});
