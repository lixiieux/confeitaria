// App Core Data and Catalog Rendering

const PRODUCTS = [
  { 
    id: 1, 
    name: "Bolo Red Velvet", 
    price: 89.90, 
    category: "bolo-caseiro", 
    tags: ["sem-gluten"], 
    image: "assets/red_velvet.png",
    description: "Bolo clássico Red Velvet com cobertura cremosa e massa super fofinha, totalmente livre de glúten." 
  },
  { 
    id: 2, 
    name: "Bolo de Fubá com Limão", 
    price: 150.00, 
    category: "bolo-caseiro", 
    tags: ["low-carb"], 
    image: "assets/hero_cake.png",
    description: "Massa de fubá tradicional com um toque cítrico de limão, receita de baixo carboidrato." 
  },
  { 
    id: 3, 
    name: "Brigadeiro Gourmet (12un)", 
    price: 54.00, 
    category: "docinhos", 
    tags: ["vegano"], 
    image: "assets/brigadeiros.png",
    description: "Deliciosos brigadeiros artesanais feitos com cacau nobre e leite condensado de coco 100% vegano." 
  },
  { 
    id: 4, 
    name: "Bolo de Banana Fit", 
    price: 75.00, 
    category: "bolo-fitness", 
    tags: ["no-sugar", "low-carb"], 
    image: "assets/healthy_cake.png",
    description: "Bolo integral de banana com aveia e canela, sem adição de açúcar e low-carb." 
  },
  { 
    id: 5, 
    name: "Cheesecake de Morango", 
    price: 120.00, 
    category: "bolo-caseiro", 
    tags: ["sem-lactose"], 
    image: "assets/hero_cake.png",
    description: "Base crocante com creme suave de queijo e calda artesanal de morangos frescos, sem lactose." 
  },
  { 
    id: 6, 
    name: "Bolo de Chocolate Zero", 
    price: 95.00, 
    category: "bolo-fitness", 
    tags: ["no-sugar", "vegano"], 
    image: "assets/healthy_cake.png",
    description: "Massa fofinha de chocolate belga, sem açúcar e totalmente vegano." 
  },
];

const RECIPES = [
  {
    id: 1,
    title: "Bolo de Cenoura Zero Açúcar",
    desc: "A receita perfeita do clássico bolo de cenoura com cobertura de chocolate, adoçado naturalmente.",
    image: "assets/healthy_cake.png",
    ingredients: [
      "3 cenouras médias picadas",
      "3 ovos inteiros",
      "1/2 xícara de óleo de coco ou manteiga derretida",
      "2 xícaras de farinha de aveia",
      "1 xícara de eritritol ou xilitol",
      "1 colher de sopa de fermento químico em pó",
      "Cobertura: 100g de chocolate 70% cacau derretido com leite de amêndoas"
    ],
    instructions: [
      "No liquidificador, bata as cenouras, os ovos e o óleo de coco até obter um creme homogêneo.",
      "Em um recipiente, misture a farinha de aveia e o adoçante.",
      "Despeje o creme do liquidificador sobre os ingredientes secos e misture bem.",
      "Adicione o fermento e incorpore delicadamente.",
      "Asse em forno preaquecido a 180°C por aproximadamente 35 minutos.",
      "Cubra com a calda de chocolate 70% derretido e sirva!"
    ]
  },
  {
    id: 2,
    title: "Muffin de Mirtilo e Aveia",
    desc: "Muffins funcionais fofinhos, cheios de antioxidantes e perfeitos para o lanche da tarde.",
    image: "assets/hero_cake.png",
    ingredients: [
      "2 bananas maduras amassadas",
      "2 ovos",
      "1 xícara de farinha de amêndoas",
      "1/2 xícara de farelo de aveia",
      "3 colheres de sopa de mel ou calda de agave",
      "1 xícara de mirtilos frescos ou congelados",
      "1 colher de chá de fermento em pó"
    ],
    instructions: [
      "Misture as bananas amassadas, ovos e mel em uma tigela.",
      "Adicione as farinhas e misture até homogeneizar.",
      "Incorpore delicadamente os mirtilos e o fermento.",
      "Distribua em forminhas de muffin e asse a 180°C por 20 minutos."
    ]
  },
  {
    id: 3,
    title: "Brigadeiro Funcional de Biomassa",
    desc: "Um doce saudável para matar a vontade, usando biomassa de banana verde rica em fibras.",
    image: "assets/brigadeiros.png",
    ingredients: [
      "1 xícara de biomassa de banana verde morna",
      "3 colheres de sopa de cacau em pó 100%",
      "3 colheres de sopa de açúcar de coco ou xilitol",
      "1 colher de chá de óleo de coco",
      "Granulado de chocolate amargo para enrolar"
    ],
    instructions: [
      "Em uma panela, junte a biomassa, cacau, adoçante e óleo de coco.",
      "Cozinhe em fogo baixo mexendo sempre até desprender do fundo da panela.",
      "Deixe esfriar completamente na geladeira.",
      "Enrole bolinhas e passe no granulado amargo."
    ]
  }
];

// Current filter states
let currentCategory = 'all';
let selectedTag = null;
let searchQuery = '';

// Load Username to Navbar Profile Link
function setupUserProfileHeader() {
    const token = localStorage.getItem('dolcevita_token');
    if (!token) return;
    
    // Simple JWT parse to display username
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username = payload.sub;
        const profileLink = document.querySelector('.nav-link[href="perfil.html"]');
        if (profileLink) {
            profileLink.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Olá, ${username}`;
        }
    } catch (e) {
        console.error('Error decoding token:', e);
    }
}

// Render Products Grid based on search and filters
function renderProducts() {
    const grid = document.getElementById('product-list');
    if (!grid) return;

    let filtered = PRODUCTS;

    // Apply category filter
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    // Apply tag filter
    if (selectedTag) {
        filtered = filtered.filter(p => p.tags.includes(selectedTag));
    }

    // Apply search query
    if (searchQuery) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--orange-dark);">
                <h3 style="font-size: 24px;">Nenhum bolo encontrado</h3>
                <p style="margin-top: 10px;">Tente alterar os termos da busca ou os filtros aplicados.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <img class="product-card-img" src="${p.image}" alt="${p.name}">
            <div class="name">${p.name}</div>
            <div class="tags">
                ${p.tags.map(t => `<span class="tag">${t.replace('-', ' ')}</span>`).join('')}
            </div>
            <div class="price">R$ ${p.price.toFixed(2)}</div>
            <div class="actions">
                <button class="btn-primary small" onclick="window.location.href='produto.html?id=${p.id}'">Ver Detalhes</button>
            </div>
        </div>
    `).join('');
}

// Render Recipe Cards
function renderRecipes() {
    const list = document.getElementById('recipes-list');
    if (!list) return;
    
    list.innerHTML = RECIPES.map(r => `
        <div class="recipe-card">
            <img class="recipe-card-img" src="${r.image}" alt="${r.title}">
            <div class="recipe-card-content">
                <h4>${r.title}</h4>
                <p>${r.desc}</p>
                <div class="btn-read-recipe" onclick="openRecipeModal(${r.id})">Ver Receita Completa →</div>
            </div>
        </div>
    `).join('');
}

// Open Recipe Detail Modal
function openRecipeModal(recipeId) {
    const r = RECIPES.find(item => item.id === recipeId);
    if (!r) return;
    
    // Create dynamically a modal on top of DOM
    const modal = document.createElement('div');
    modal.id = 'recipe-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(58, 32, 37, 0.4)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.zIndex = '2000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '20px';
    
    modal.innerHTML = `
        <div style="background: var(--white); border-radius: 20px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 40px; position: relative; box-shadow: var(--shadow-medium);">
            <button style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 28px; cursor: pointer; color: var(--blue-normal);" onclick="document.getElementById('recipe-modal').remove()">×</button>
            <h2 style="color: var(--red-dark); font-size: 28px; margin-bottom: 15px;">${r.title}</h2>
            <p style="margin-bottom: 25px; color: var(--text-main); font-style: italic;">${r.desc}</p>
            
            <h4 style="color: var(--blue-normal); margin-bottom: 10px;">Ingredientes:</h4>
            <ul style="margin-left: 20px; margin-bottom: 25px; line-height: 1.8;">
                ${r.ingredients.map(i => `<li>${i}</li>`).join('')}
            </ul>
            
            <h4 style="color: var(--blue-normal); margin-bottom: 10px;">Modo de Preparo:</h4>
            <ol style="margin-left: 20px; line-height: 1.8;">
                ${r.instructions.map(ins => `<li>${ins}</li>`).join('')}
            </ol>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Toggle Filter Drawer (Left Drawer)
function toggleFilterDrawer() {
    const drawer = document.getElementById('filter-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (!drawer || !backdrop) return;
    
    drawer.classList.toggle('open');
    backdrop.classList.toggle('open');
}

// Apply Filters and re-render
function applyFilterCategory(category, element) {
    currentCategory = category;
    
    // Toggle active classes on custom filter links
    document.querySelectorAll('.filter-cat-btn').forEach(b => b.classList.remove('active'));
    if (element) element.classList.add('active');
    
    renderProducts();
}

function applyFilterTag(tag) {
    if (selectedTag === tag) {
        selectedTag = null; // deactivate if clicked again
    } else {
        selectedTag = tag;
    }
    
    // Update active badges states
    document.querySelectorAll('.diet-badge-item').forEach(el => {
        const t = el.getAttribute('data-tag');
        if (t === selectedTag) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    
    renderProducts();
}

// Set up Search Listener
function initSearch() {
    const input = document.getElementById('catalog-search');
    if (!input) return;
    
    input.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderProducts();
    });
}

// Initial Draw catalog / homepage details
document.addEventListener('DOMContentLoaded', () => {
    setupUserProfileHeader();
    renderProducts();
    renderRecipes();
    initSearch();
    
    // Setup Filter Drawer to DOM if not already present
    if (document.getElementById('product-list') && !document.getElementById('filter-drawer')) {
        const drawer = document.createElement('div');
        drawer.id = 'filter-drawer';
        drawer.className = 'drawer left';
        drawer.innerHTML = `
            <div class="drawer-header">
                <h3>Filtros</h3>
                <button class="drawer-close" onclick="toggleFilterDrawer()">×</button>
            </div>
            <div class="drawer-body">
                <h4 style="margin-bottom: 15px; color: var(--red-dark);">Categorias</h4>
                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;">
                    <a href="#" class="filter-cat-btn active" style="font-size:18px;" onclick="applyFilterCategory('all', this); toggleFilterDrawer();">
                        <svg class="icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                        Todos os Bolos
                    </a>
                    <a href="#" class="filter-cat-btn" style="font-size:18px;" onclick="applyFilterCategory('bolo-caseiro', this); toggleFilterDrawer();">
                        <svg class="icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        Bolos Caseiros
                    </a>
                    <a href="#" class="filter-cat-btn" style="font-size:18px;" onclick="applyFilterCategory('bolo-fitness', this); toggleFilterDrawer();">
                        <svg class="icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        Bolos Fitness
                    </a>
                    <a href="#" class="filter-cat-btn" style="font-size:18px;" onclick="applyFilterCategory('docinhos', this); toggleFilterDrawer();">
                        <svg class="icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"></path></svg>
                        Docinhos Saudáveis
                    </a>
                </div>
                
                <h4 style="margin-bottom: 15px; color: var(--red-dark);">Restrições Dietéticas</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    <button class="size-option" style="display:inline-flex; align-items:center; gap:6px;" onclick="applyFilterTag('sem-gluten'); toggleFilterDrawer();">
                        <svg class="icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M8 5a4 4 0 0 1 4 4 4 4 0 0 1-4-4zM16 9a4 4 0 0 0-4-4 4 4 0 0 0 4 4zM8 13a4 4 0 0 1 4 4 4 4 0 0 1-4-4zM16 17a4 4 0 0 0-4-4 4 4 0 0 0 4 4z"></path></svg>
                        Sem Glúten
                    </button>
                    <button class="size-option" style="display:inline-flex; align-items:center; gap:6px;" onclick="applyFilterTag('low-carb'); toggleFilterDrawer();">
                        <svg class="icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><path d="M12 2v9M8 3v4M16 3v4"></path></svg>
                        Low Carb
                    </button>
                    <button class="size-option" style="display:inline-flex; align-items:center; gap:6px;" onclick="applyFilterTag('vegano'); toggleFilterDrawer();">
                        <svg class="icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c0 2-.52 3.5-1.62 9.2A7 7 0 0 1 11 20z"></path></svg>
                        Vegano
                    </button>
                    <button class="size-option" style="display:inline-flex; align-items:center; gap:6px;" onclick="applyFilterTag('no-sugar'); toggleFilterDrawer();">
                        <svg class="icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                        Sem Açúcar
                    </button>
                    <button class="size-option" style="display:inline-flex; align-items:center; gap:6px;" onclick="applyFilterTag('sem-lactose'); toggleFilterDrawer();">
                        <svg class="icon-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l1 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7l1-4z"></path><line x1="5" y1="10" x2="19" y2="10"></line></svg>
                        Sem Lactose
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(drawer);
    }
});
