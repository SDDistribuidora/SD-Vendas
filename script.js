document.addEventListener('DOMContentLoaded', () => {
    
    // --- DADOS DO FRONT-END ATUALIZADOS PARA CAIXA FECHADA ---
    const products = [
        {
            id: 1,
            name: "Vodka Ignite (Caixa)",
            price: 960.00, // Preço da CAIXA
            images: ["assets/vodka1.jpg", "assets/vodka2.jpeg", "assets/vodka3.jpg", "assets/vodka4.jpg"],
            shortDescription: "Caixa com 12 unidades. Uma vodka ultra premium, destilada para pureza e suavidade.",
            longDescription: "A Vodka Ignite redefine o padrão de luxo. Produzida a partir dos melhores grãos e água puríssima, passa por um processo de múltipla destilação que garante um sabor incrivelmente suave e um acabamento limpo. Perfeita para ser apreciada pura ou em coquetéis sofisticados.",
            details: ["Tipo: Vodka Ultra Premium", "Volume: 750ml por garrafa", "Teor Alcoólico: 40%", "Venda por caixa com 12 unidades"],
        },
        {
            id: 2,
            name: "Gin Ignite (Caixa)",
            price: 510.00, // Preço da CAIXA
            images: ["assets/Gin1.jpg", "assets/Gin2.jpg", "assets/Gin3.jpg", "assets/Gin4.jpg"],
            shortDescription: "Caixa com 6 unidades. Um gin artesanal com uma infusão botânica única.",
            longDescription: "O Gin Ignite é uma celebração de sabores. Criado com uma seleção cuidadosa de botânicos exóticos e zimbro de alta qualidade, este gin oferece um perfil aromático complexo e refrescante. Ideal para um gin tônica clássico ou para explorar novas criações de coquetelaria.",
            details: ["Tipo: London Dry Gin", "Volume: 750ml por garrafa", "Teor Alcoólico: 43%", "Venda por caixa com 6 unidades"],
        },
    ];
    
    let cart = [];
    let selectedShipping = null;
    const appRoot = document.getElementById('app-root');
    const backendUrl = 'https://sd-vendas.onrender.com'; 

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

    const renderHomePage = () => {
        const homeContainer = document.createElement('div');
        homeContainer.className = 'container';
        homeContainer.style.cssText = 'display: flex; flex-direction: column; gap: 3rem;';
        
        const aboutSection = document.createElement('section');
        aboutSection.className = 'about-section';
        aboutSection.innerHTML = `
            <div class="about-image-col">
                <img src="assets/logo.png" alt="Logo S&D Distribuidora" class="about-image">
            </div>
            <div class="about-text-col">
                <h2 class="about-title">Qualidade Premium, Entregue a Você</h2>
                <p class="about-description">
                    Somos especialistas em selecionar e distribuir um catálogo incomparável de produtos premium. Com foco em variedade e na mais alta qualidade, nosso compromisso é com a excelência, da nossa porta para a sua.
                </p>
            </div>
        `;
        homeContainer.appendChild(aboutSection);

        const featuresSection = document.createElement('section');
        featuresSection.className = 'features-section';
        featuresSection.innerHTML = [
            { icon: 'car-outline', title: 'Entrega Rápida', description: 'Receba seus produtos o mais rápido possível.' },
            { icon: 'shield-outline', title: 'Entrega Segura', description: 'Garantimos que seus produtos chegarão sem defeitos ou danos.' },
            { icon: 'card-outline', title: 'Pagamento Seguro', description: 'Processamos seus pagamentos com a máxima segurança.' }
        ].map(feature => `
            <div class="feature-card">
                <ion-icon name="${feature.icon}" class="feature-icon"></ion-icon>
                <h3 class="feature-title">${feature.title}</h3>
                <p class="feature-description">${feature.description}</p>
            </div>
        `).join('');
        homeContainer.appendChild(featuresSection);
        appRoot.appendChild(homeContainer);
    };

    const renderProductsPage = () => {
        const productsSection = document.createElement('section');
        productsSection.id = 'products';
        productsSection.className = 'container';
        const productListDiv = document.createElement('div');
        productListDiv.className = 'product-grid';
        products.forEach((product) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.images[0]}" alt="${product.name}" class="product-image">
                <div class="product-details">
                    <h2 class="product-title">${product.name}</h2>
                    <p class="product-description">${product.shortDescription}</p>
                    <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                    <button class="button view-details-btn" data-id="${product.id}">Ver Detalhes</button>
                </div>
            `;
            productListDiv.appendChild(card);
        });
        productsSection.appendChild(productListDiv); 
        appRoot.appendChild(productsSection);
    };

    const renderFooter = () => {
        const footer = document.createElement('footer');
        footer.className = 'new-footer';
        footer.innerHTML = `
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-column">
                        <h3>S&D Distribuidora</h3>
                        <p>Representamos e distribuímos uma ampla gama de produtos premium, garantindo a melhor qualidade para os nossos clientes.</p>
                    </div>
                    <div class="footer-column">
                        <h3>Contato</h3>
                        <div class="contact-item">
                            <ion-icon name="mail-outline"></ion-icon>
                            <span>seddistribuidora@yahoo.com</span>
                        </div>
                        <div class="contact-item">
                            <ion-icon name="logo-whatsapp"></ion-icon>
                            <a href="https://wa.me/553498714483" target="_blank">+55 34 9136-0693</a>
                        </div>
                        <div class="contact-item">
                            <ion-icon name="logo-instagram"></ion-icon>
                            <a href="https://www.instagram.com/sed.distribuidoramg" target="_blank">@sed.distribuidoramg</a>
                        </div>
                        <div class="contact-item">
                            <ion-icon name="location-outline"></ion-icon>
                            <span>Uberlândia, MG</span>
                        </div>
                    </div>
                </div>
                <div class="footer-divider"></div>
                <p class="footer-copyright">© 2025 S&D Distribuidora. Todos os direitos reservados.</p>
            </div>
        `;
        appRoot.appendChild(footer);
    };

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
            cartFooter.innerHTML = '';
            cartFooter.style.display = 'none';
        } else {
            const subtotal = cart.reduce((sum, item) => {
                const product = products.find(p => p.id === item.id);
                return sum + (product.price * item.quantity);
            }, 0);

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
            }).join('') + `
                <div class="cart-subtotal">
                    <span>Subtotal</span>
                    <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="shipping-calc">
                    <input type="text" id="cep-input" placeholder="Calcular frete (CEP)">
                    <button class="button small-btn" id="calc-shipping-btn">Calcular</button>
                </div>
                <div id="shipping-options"></div>
            `;

            cartFooter.style.display = 'block';
            cartFooter.innerHTML = `
                <div class="customer-details" style="display: none;">
                    <input type="text" id="customer-name" placeholder="Nome Completo">
                    <input type="text" id="customer-cpf" placeholder="CPF ou CNPJ">
                </div>
                <div id="final-total" class="final-total" style="display: none;"></div>
                <button class="button" id="checkout-btn" style="display: none;">Ir para Pagamento</button>
            `;
        }
    };
    
    const createCartShell = () => {
        if (document.querySelector('.cart-overlay')) return;
        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        overlay.innerHTML = `
            <div class="cart-sidebar">
                <div class="cart-header">
                    <h3>Seu Carrinho</h3>
                    <ion-icon name="close-outline" class="cart-close-btn"></ion-icon>
                </div>
                <div class="cart-body"></div>
                <div class="cart-footer"></div>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    const toggleCart = (show) => {
        const overlay = document.querySelector('.cart-overlay');
        const sidebar = document.querySelector('.cart-sidebar');
        if (overlay && sidebar) {
            if (show) {
                updateCartView();
                overlay.classList.add('active');
                sidebar.classList.add('active');
                document.body.classList.add('cart-open');
            } else {
                overlay.classList.remove('active');
                sidebar.classList.remove('active');
                document.body.classList.remove('cart-open');
            }
        }
    };

    const openProductModal = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        let currentImageIndex = 0;
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <button class="modal-close-btn"><ion-icon name="close-outline"></ion-icon></button>
                <div class="modal-gallery">
                    <div class="modal-main-image-wrapper">
                        <img src="${product.images[currentImageIndex]}" alt="${product.name}" class="modal-main-image">
                        <button class="gallery-nav prev"><ion-icon name="chevron-back-outline"></ion-icon></button>
                        <button class="gallery-nav next"><ion-icon name="chevron-forward-outline"></ion-icon></button>
                    </div>
                    <div class="modal-thumbnails">
                        ${product.images.map((img, index) => `<img src="${img}" alt="Thumbnail ${index + 1}" class="modal-thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">`).join('')}
                    </div>
                </div>
                <div class="modal-info">
                    <h2>${product.name}</h2>
                    <p class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                    <p class="description">${product.longDescription}</p>
                    <ul class="details-list">
                        ${product.details.map(detail => `<li><ion-icon name="checkmark-circle-outline"></ion-icon>${detail}</li>`).join('')}
                    </ul>
                    <button class="button add-to-cart-btn" data-id="${product.id}">Adicionar Caixa ao Carrinho</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
        
        setTimeout(() => modalOverlay.classList.add('active'), 10);
        document.body.classList.add('modal-open');
        
        const mainImage = modalOverlay.querySelector('.modal-main-image');
        const thumbnails = modalOverlay.querySelectorAll('.modal-thumbnail');
        
        const updateGallery = () => {
            mainImage.src = product.images[currentImageIndex];
            thumbnails.forEach((thumb, index) => {
                thumb.classList.toggle('active', index === currentImageIndex);
            });
        };

        modalOverlay.querySelector('.next').addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % product.images.length;
            updateGallery();
        });

        modalOverlay.querySelector('.prev').addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
            updateGallery();
        });

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                currentImageIndex = parseInt(thumb.dataset.index);
                updateGallery();
            });
        });
    };
    
    const handleShippingCalculation = async () => {
        const cepInput = document.getElementById('cep-input');
        const calcBtn = document.getElementById('calc-shipping-btn');
        const shippingOptionsDiv = document.getElementById('shipping-options');

        const cepDestino = cepInput.value.replace(/\D/g, '');
        if (cepDestino.length !== 8) {
            shippingOptionsDiv.innerHTML = `<p class="shipping-error">CEP inválido.</p>`;
            return;
        }

        calcBtn.textContent = '...';
        calcBtn.disabled = true;
        shippingOptionsDiv.innerHTML = `<p>Calculando...</p>`;

        try {
            const response = await fetch(`${backendUrl}/calcular-frete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart, cepDestino })
            });

            const options = await response.json();
            if (!response.ok || options.length === 0) {
                throw new Error(options.error || 'Nenhuma opção de frete encontrada.');
            }
            
            shippingOptionsDiv.innerHTML = `
                <h4>Escolha uma opção de frete:</h4>
                ${options.map(opt => `
                    <div class="shipping-option">
                        <input type="radio" name="shipping" id="ship-${opt.id}" value="${opt.price}" data-name="${opt.name}">
                        <label for="ship-${opt.id}">
                            <span>${opt.name} - <b>R$ ${opt.custom_price.replace('.', ',')}</b></span>
                            <span>Prazo: ${opt.custom_delivery_time} dias</span>
                        </label>
                    </div>
                `).join('')}`;

        } catch (error) {
            shippingOptionsDiv.innerHTML = `<p class="shipping-error">Erro: ${error.message}</p>`;
        } finally {
            calcBtn.textContent = 'Calcular';
            calcBtn.disabled = false;
        }
    };
    
    const updateTotal = () => {
        const finalTotalDiv = document.getElementById('final-total');
        const checkoutBtn = document.getElementById('checkout-btn');
        const customerDetailsDiv = document.querySelector('.customer-details');

        if (!selectedShipping) {
            finalTotalDiv.style.display = 'none';
            checkoutBtn.style.display = 'none';
            customerDetailsDiv.style.display = 'none';
            return;
        }
        
        const subtotal = cart.reduce((sum, item) => {
            const product = products.find(p => p.id === item.id);
            return sum + (product.price * item.quantity);
        }, 0);
        
        const total = subtotal + parseFloat(selectedShipping.price);
        
        finalTotalDiv.innerHTML = `
            <div>
                <span>Frete (${selectedShipping.name})</span>
                <span>R$ ${parseFloat(selectedShipping.price).toFixed(2).replace('.', ',')}</span>
            </div>
            <div>
                <strong>Total</strong>
                <strong>R$ ${total.toFixed(2).replace('.', ',')}</strong>
            </div>
        `;
        finalTotalDiv.style.display = 'flex';
        customerDetailsDiv.style.display = 'flex';
        checkoutBtn.style.display = 'block';
    };

    const handleCheckout = async () => {
        const checkoutBtn = document.getElementById('checkout-btn');
        const customerNameInput = document.getElementById('customer-name');
        const customerCpfInput = document.getElementById('customer-cpf');

        const customer = {
            name: customerNameInput.value,
            cpfCnpj: customerCpfInput.value.replace(/\D/g, '')
        };

        if (!customer.name || !customer.cpfCnpj) {
            alert('Por favor, preencha seu nome e CPF/CNPJ.');
            return;
        }

        checkoutBtn.textContent = 'Gerando link...';
        checkoutBtn.disabled = true;

        try {
            const response = await fetch(`${backendUrl}/criar-pagamento`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart, shippingOption: selectedShipping, customer })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.details || data.error || 'Não foi possível gerar o link.');
            }

            window.location.href = data.paymentLink;

        } catch (error) {
            alert(`Erro ao finalizar a compra: ${error.message}`);
            checkoutBtn.textContent = 'Ir para Pagamento';
            checkoutBtn.disabled = false;
        }
    };

    const initializeEventListeners = () => {
        document.body.addEventListener('click', function(event) {
            const navLink = event.target.closest('.nav-link');
            if (navLink) {
                event.preventDefault();
                renderPage(navLink.dataset.page);
                return;
            }

            const detailsButton = event.target.closest('.view-details-btn');
            if (detailsButton) {
                const productId = parseInt(detailsButton.dataset.id);
                openProductModal(productId);
                return;
            }
            
            const addToCartButton = event.target.closest('.add-to-cart-btn');
            if (addToCartButton) {
                const productId = parseInt(addToCartButton.dataset.id);
                addToCart(productId);
                const modal = document.querySelector('.modal-overlay.active');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.classList.remove('modal-open');
                    setTimeout(() => modal.remove(), 300);
                }
                return;
            }

            const cartIcon = event.target.closest('.cart-icon-wrapper');
            if (cartIcon) {
                toggleCart(true);
                return;
            }

            const closeCartBtn = event.target.closest('.cart-close-btn');
            const cartOverlay = event.target.closest('.cart-overlay');
            if (closeCartBtn || (cartOverlay && !event.target.closest('.cart-sidebar'))) {
                toggleCart(false);
                return;
            }

            const cartItem = event.target.closest('.cart-item');
            if (cartItem) {
                const productId = parseInt(cartItem.dataset.id);
                const item = cart.find(i => i.id === productId);
                if (event.target.closest('.increase-qty')) {
                    updateQuantity(productId, item.quantity + 1);
                }
                if (event.target.closest('.decrease-qty')) {
                    updateQuantity(productId, item.quantity - 1);
                }
                if (event.target.closest('.remove-item-btn')) {
                    updateQuantity(productId, 0);
                }
                return;
            }
            
            const modal = document.querySelector('.modal-overlay.active');
            if (modal) {
                const closeBtn = event.target.closest('.modal-close-btn');
                if (closeBtn || !event.target.closest('.modal-content')) {
                    modal.classList.remove('active');
                    document.body.classList.remove('modal-open');
                    setTimeout(() => modal.remove(), 300);
                }
            }
            
            if (event.target.id === 'calc-shipping-btn') {
                handleShippingCalculation();
                return;
            }

            if (event.target.name === 'shipping') {
                selectedShipping = {
                    price: event.target.value,
                    name: event.target.dataset.name
                };
                updateTotal();
                return;
            }
            
            if (event.target.id === 'checkout-btn') {
                handleCheckout();
                return;
            }
        });
    };

    loadCart();
    createCartShell();
    renderPage('home');
    initializeEventListeners();
});
