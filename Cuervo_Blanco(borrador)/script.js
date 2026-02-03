// ========================================
// Configuración PDF.js
// ========================================
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ========================================
// Base de Datos de Libros
// ========================================
const booksDatabase = [
    {
        id: 1,
        title: "Cien Años de Soledad",
        author: "Gabriel García Márquez",
        category: "literatura",
        coverImage: "assets/covers/portada_cien_anos_de_soledad.jpg",
        bookFile: "assets/pdfs/cien_anos_de_soledad.pdf",
        fileType: "pdf"
    },
    {
        id: 2,
        title: "Historia del Perú Antiguo",
        author: "Luis G. Lumbreras",
        category: "historia",
        coverImage: "assets/covers/historia-peru.jpg",
        bookFile: "assets/epubs/historia-peru.epub",
        fileType: "epub"
    },
    {
        id: 3,
        title: "Introducción a la Física Cuántica",
        author: "Richard Feynman",
        category: "ciencia",
        coverImage: "assets/covers/fisica-cuantica.jpg",
        bookFile: "assets/pdfs/fisica-cuantica.pdf",
        fileType: "pdf"
    },
    {
        id: 4,
        title: "El Principito",
        author: "Antoine de Saint-Exupéry",
        category: "infantil",
        coverImage: "assets/covers/el-principito.jpg",
        bookFile: "assets/epubs/el-principito.epub",
        fileType: "epub"
    },
    {
        id: 5,
        title: "Pedagogía del Oprimido",
        author: "Paulo Freire",
        category: "educacion",
        coverImage: "assets/covers/pedagogia-oprimido.jpg",
        bookFile: "assets/pdfs/pedagogia-oprimido.pdf",
        fileType: "pdf"
    },
    {
        id: 6,
        title: "Historia del Arte Moderno",
        author: "H.H. Arnason",
        category: "arte",
        coverImage: "assets/covers/arte-moderno.jpg",
        bookFile: "assets/epubs/arte-moderno.epub",
        fileType: "epub"
    },
    {
        id: 7,
        title: "Tradiciones de Huancayo",
        author: "Ricardo Palma",
        category: "literatura",
        coverImage: "assets/covers/tradiciones-huancayo.jpg",
        bookFile: "assets/pdfs/tradiciones-huancayo.pdf",
        fileType: "pdf"
    },
    {
        id: 8,
        title: "Los Miserables",
        author: "Victor Hugo",
        category: "literatura",
        coverImage: "assets/covers/los-miserables.jpg",
        bookFile: "assets/epubs/los-miserables.epub",
        fileType: "epub"
    },
    {
        id: 9,
        title: "Breve Historia del Tiempo",
        author: "Stephen Hawking",
        category: "ciencia",
        coverImage: "assets/covers/historia-tiempo.jpg",
        bookFile: "assets/pdfs/historia-tiempo.pdf",
        fileType: "pdf"
    },
    {
        id: 10,
        title: "Alicia en el País de las Maravillas",
        author: "Lewis Carroll",
        category: "infantil",
        coverImage: "assets/covers/alicia.jpg",
        bookFile: "assets/epubs/alicia.epub",
        fileType: "epub"
    },
    {
        id: 11,
        title: "Estrategias de Aprendizaje",
        author: "John Hattie",
        category: "educacion",
        coverImage: "assets/covers/estrategias-aprendizaje.jpg",
        bookFile: "assets/pdfs/estrategias-aprendizaje.pdf",
        fileType: "pdf"
    },
    {
        id: 12,
        title: "El Arte del Renacimiento",
        author: "Giorgio Vasari",
        category: "arte",
        coverImage: "assets/covers/renacimiento.jpg",
        bookFile: "assets/epubs/renacimiento.epub",
        fileType: "epub"
    }
];

// ========================================
// Variables Globales
// ========================================
let currentBooks = [...booksDatabase];
let currentOpenBook = null;
let currentPdfDoc = null;
let currentEpubBook = null;
let currentRendition = null;
let currentPage = 1;
let totalPages = 0;
let pageRendering = false;

// ========================================
// Inicialización
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    renderBooks(currentBooks);
    initializeEventListeners();
});

// ========================================
// Renderizar Libros con Portadas
// ========================================
function renderBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    booksGrid.innerHTML = '';

    if (books.length === 0) {
        booksGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-light);">
                <i class="fas fa-book-open" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p style="font-size: 1.3rem;">No se encontraron libros con esos criterios</p>
            </div>
        `;
        return;
    }

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        
        bookCard.innerHTML = `
            <div class="book-cover-image">
                <img src="${book.coverImage}" alt="${book.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="book-cover-fallback" style="display: none; background: linear-gradient(135deg, ${getRandomGradient()});">
                    <i class="${getCategoryIcon(book.category)}"></i>
                    <div class="book-cover-text">
                        <div class="book-cover-title">${book.title}</div>
                    </div>
                </div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">por ${book.author}</p>
                <span class="book-category">${getCategoryName(book.category)}</span>
            </div>
        `;

        bookCard.addEventListener('click', () => openBook(book));
        booksGrid.appendChild(bookCard);
    });

    updateResultsCount(books.length);
}

// ========================================
// Sistema de Búsqueda y Filtros
// ========================================
function initializeEventListeners() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        applyFiltersAndSearch();
    });

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFiltersAndSearch();
        });
    });

    document.getElementById('closeModal').addEventListener('click', closeBook);
    document.getElementById('modalOverlay').addEventListener('click', closeBook);

    document.getElementById('prevPage').addEventListener('click', () => changePage(-2));
    document.getElementById('nextPage').addEventListener('click', () => changePage(2));
    document.getElementById('prevPageFlip').addEventListener('click', () => changePage(-2));
    document.getElementById('nextPageFlip').addEventListener('click', () => changePage(2));

    const pageInput = document.getElementById('pageInput');
    pageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const pageNum = parseInt(pageInput.value);
            if (pageNum >= 1 && pageNum <= totalPages) {
                goToPage(pageNum);
            }
            pageInput.value = '';
        }
    });
}

function applyFiltersAndSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const activeCategory = document.querySelector('.filter-btn.active').dataset.category;

    currentBooks = booksDatabase.filter(book => {
        const matchesSearch = 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm);

        const matchesCategory = activeCategory === 'todos' || book.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    renderBooks(currentBooks);
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    resultsCount.textContent = `Mostrando ${count} libro${count !== 1 ? 's' : ''}`;
}

// ========================================
// Sistema de Lectura: PDF y ePub
// ========================================
async function openBook(book) {
    currentOpenBook = book;
    currentPage = 1;

    const modal = document.getElementById('bookModal');
    document.getElementById('readerBookTitle').textContent = book.title;
    document.getElementById('readerBookAuthor').textContent = `por ${book.author}`;

    document.getElementById('pdfLoader').style.display = 'flex';
    document.querySelector('.book-viewer').style.display = 'none';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
        if (book.fileType === 'pdf') {
            await loadPdfBook(book);
        } else if (book.fileType === 'epub') {
            await loadEpubBook(book);
        }
    } catch (error) {
        console.error('Error cargando libro:', error);
        alert(`Error al cargar el libro. Verifica que el archivo ${book.fileType.toUpperCase()} existe en: ${book.bookFile}`);
        closeBook();
    }
}

// ========================================
// Cargar y Renderizar PDF - DOBLE PÁGINA
// ========================================
async function loadPdfBook(book) {
    const loadingTask = pdfjsLib.getDocument(book.bookFile);
    currentPdfDoc = await loadingTask.promise;
    totalPages = currentPdfDoc.numPages;

    document.getElementById('pdfLoader').style.display = 'none';
    document.querySelector('.book-viewer').style.display = 'flex';

    await renderDoublePage();
}

async function renderDoublePage() {
    if (!currentPdfDoc) return;

    const leftCanvas = document.getElementById('leftPageCanvas');
    const rightCanvas = document.getElementById('rightPageCanvas');
    
    // Asegurarse de que ambos canvas estén visibles
    leftCanvas.style.display = 'block';
    rightCanvas.style.display = 'block';
    document.querySelector('.left-page-container').style.display = 'block';
    document.querySelector('.right-page-container').style.display = 'block';
    document.querySelector('.book-spine').style.display = 'block';
    
    // Página izquierda (siempre impar)
    const leftPageNum = currentPage % 2 === 0 ? currentPage - 1 : currentPage;
    // Página derecha (siempre par)
    const rightPageNum = leftPageNum + 1;

    // Renderizar ambas páginas
    await renderPdfPage(leftPageNum, leftCanvas);
    
    if (rightPageNum <= totalPages) {
        await renderPdfPage(rightPageNum, rightCanvas);
    } else {
        // Última página - limpiar canvas derecho
        const ctx = rightCanvas.getContext('2d');
        ctx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
    }

    updatePageCounter();
}

async function renderPdfPage(pageNum, canvas) {
    if (!currentPdfDoc || pageNum < 1 || pageNum > totalPages) return;

    try {
        const page = await currentPdfDoc.getPage(pageNum);
        
        // Configurar escala para buena calidad
        const scale = 1.5;
        const viewport = page.getViewport({ scale: scale });

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;
    } catch (error) {
        console.error(`Error renderizando página ${pageNum}:`, error);
    }
}

// ========================================
// Cargar y Renderizar ePub
// ========================================
async function loadEpubBook(book) {
    const leftCanvas = document.getElementById('leftPageCanvas');
    const rightCanvas = document.getElementById('rightPageCanvas');
    
    // Ocultar canvas y crear contenedores para ePub
    leftCanvas.style.display = 'none';
    rightCanvas.style.display = 'none';
    
    const leftContainer = leftCanvas.parentElement;
    const rightContainer = rightCanvas.parentElement;
    
    // Crear divs para renderizar ePub
    let leftEpubDiv = document.getElementById('leftEpubDiv');
    let rightEpubDiv = document.getElementById('rightEpubDiv');
    
    if (!leftEpubDiv) {
        leftEpubDiv = document.createElement('div');
        leftEpubDiv.id = 'leftEpubDiv';
        leftEpubDiv.className = 'epub-page-content';
        leftContainer.appendChild(leftEpubDiv);
    }
    
    if (!rightEpubDiv) {
        rightEpubDiv = document.createElement('div');
        rightEpubDiv.id = 'rightEpubDiv';
        rightEpubDiv.className = 'epub-page-content';
        rightContainer.appendChild(rightEpubDiv);
    }
    
    leftEpubDiv.style.display = 'block';
    rightEpubDiv.style.display = 'block';

    currentEpubBook = ePub(book.bookFile);
    currentRendition = currentEpubBook.renderTo('leftEpubDiv', {
        width: 500,
        height: 700,
        spread: 'always'
    });

    await currentRendition.display();
    
    currentEpubBook.loaded.navigation.then((navigation) => {
        totalPages = navigation.toc.length * 10;
    });

    document.getElementById('pdfLoader').style.display = 'none';
    document.querySelector('.book-viewer').style.display = 'flex';
    updatePageCounter();
}

// ========================================
// Navegación de Páginas
// ========================================
function changePage(delta) {
    if (currentOpenBook.fileType === 'pdf') {
        changePdfPage(delta);
    } else if (currentOpenBook.fileType === 'epub') {
        changeEpubPage(delta);
    }
}

function changePdfPage(delta) {
    if (!currentPdfDoc) return;

    let newPage = currentPage + delta;
    
    // Asegurar que siempre mostramos página impar a la izquierda
    if (newPage % 2 === 0 && delta > 0) {
        newPage = newPage - 1;
    }

    // Límites
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) return;

    // Añadir animación primero
    addFlipAnimation(delta > 0 ? 'next' : 'prev');

    // Cambiar página después del 50% de la animación (cuando está volteada)
    setTimeout(() => {
        currentPage = newPage;
        renderDoublePage();
    }, 500); // Mitad del tiempo de animación (1000ms / 2)
}

function changeEpubPage(delta) {
    if (!currentRendition) return;

    if (delta > 0) {
        currentRendition.next();
    } else {
        currentRendition.prev();
    }
    
    currentPage += delta > 0 ? 2 : -2;
    if (currentPage < 1) currentPage = 1;
    updatePageCounter();
}

function goToPage(pageNum) {
    if (!currentOpenBook) return;

    if (currentOpenBook.fileType === 'pdf') {
        if (pageNum < 1 || pageNum > totalPages) return;
        currentPage = pageNum % 2 === 0 ? pageNum - 1 : pageNum;
        renderDoublePage();
    } else if (currentOpenBook.fileType === 'epub' && currentRendition) {
        currentRendition.display(pageNum);
        currentPage = pageNum;
        updatePageCounter();
    }
}

function addFlipAnimation(direction) {
    const leftContainer = document.querySelector('.left-page-container');
    const rightContainer = document.querySelector('.right-page-container');

    // Remover animaciones anteriores
    leftContainer.classList.remove('flipping');
    rightContainer.classList.remove('flipping');

    // Forzar reflow para reiniciar animación
    void leftContainer.offsetWidth;
    void rightContainer.offsetWidth;

    if (direction === 'next') {
        rightContainer.classList.add('flipping');
        setTimeout(() => {
            rightContainer.classList.remove('flipping');
        }, 1000);
    } else {
        leftContainer.classList.add('flipping');
        setTimeout(() => {
            leftContainer.classList.remove('flipping');
        }, 1000);
    }
}

function updatePageCounter() {
    if (!currentOpenBook) return;

    const counter = document.getElementById('pageCounter');
    
    if (currentOpenBook.fileType === 'pdf') {
        const rightPage = Math.min(currentPage + 1, totalPages);
        
        if (currentPage === totalPages) {
            counter.textContent = `Página ${currentPage} de ${totalPages}`;
        } else {
            counter.textContent = `Páginas ${currentPage}-${rightPage} de ${totalPages}`;
        }
    } else if (currentOpenBook.fileType === 'epub') {
        counter.textContent = `Sección ${Math.max(1, Math.floor(currentPage / 2))}`;
    }

    // Deshabilitar botones según corresponda
    const prevButtons = [document.getElementById('prevPage'), document.getElementById('prevPageFlip')];
    const nextButtons = [document.getElementById('nextPage'), document.getElementById('nextPageFlip')];

    prevButtons.forEach(btn => btn.disabled = currentPage <= 1);
    
    if (currentOpenBook.fileType === 'pdf') {
        nextButtons.forEach(btn => btn.disabled = currentPage >= totalPages - 1);
    }
}

// ========================================
// Cerrar Libro
// ========================================
function closeBook() {
    const modal = document.getElementById('bookModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    if (currentPdfDoc) {
        currentPdfDoc.destroy();
        currentPdfDoc = null;
    }
    
    if (currentEpubBook) {
        currentEpubBook.destroy();
        currentEpubBook = null;
        currentRendition = null;
    }
    
    // Limpiar contenedores ePub
    const leftEpubDiv = document.getElementById('leftEpubDiv');
    const rightEpubDiv = document.getElementById('rightEpubDiv');
    if (leftEpubDiv) leftEpubDiv.style.display = 'none';
    if (rightEpubDiv) rightEpubDiv.style.display = 'none';
    
    // Mostrar canvas PDF
    document.getElementById('leftPageCanvas').style.display = 'block';
    document.getElementById('rightPageCanvas').style.display = 'block';
    
    currentOpenBook = null;
    currentPage = 1;
    totalPages = 0;
}

// ========================================
// Funciones Auxiliares
// ========================================
function getCategoryIcon(category) {
    const icons = {
        literatura: 'fas fa-feather',
        historia: 'fas fa-landmark',
        ciencia: 'fas fa-flask',
        infantil: 'fas fa-child',
        educacion: 'fas fa-graduation-cap',
        arte: 'fas fa-palette'
    };
    return icons[category] || 'fas fa-book';
}

function getCategoryName(category) {
    const names = {
        literatura: 'Literatura',
        historia: 'Historia',
        ciencia: 'Ciencia',
        infantil: 'Infantil',
        educacion: 'Educación',
        arte: 'Arte'
    };
    return names[category] || 'General';
}

function getRandomGradient() {
    const gradients = [
        '#2d4a3e, #4d6a5e',
        '#3d5a4e, #c9b17a',
        '#2d4a3e, #e8dcc4',
        '#4d6a5e, #c9b17a',
        '#3d5a4e, #2d4a3e',
        '#c9b17a, #4d6a5e'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
}

// ========================================
// Atajos de Teclado
// ========================================
document.addEventListener('keydown', (e) => {
    if (!currentOpenBook) return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        changePage(2);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        changePage(-2);
    } else if (e.key === 'Escape') {
        closeBook();
    }
});
