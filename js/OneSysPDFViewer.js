var url = "";
var pdfDoc = null;
var canvasId = null;
var currentPage = 0;
var currentZoom = 100;

// Variable chargée depuis la balise <script>, crée un raccourci pour accéder aux eports de PDF.js
var pdfjsLib = window['pdfjs-dist/build/pdf'];

//La propriété workerSrc doit être spécifiée.
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

window.onload = function(){
  //initialisation des évènements du viewer
  document.getElementById('zoom-num').addEventListener('keyup', onInputZoom);
  document.getElementById('page-num').addEventListener('keyup', onInputPage);
  document.getElementById('zoom-out').addEventListener('click', onZoomOut);
  document.getElementById('zoom-in').addEventListener('click', onZoomIn);
  document.getElementById('prev-page').addEventListener('click', onPrevPage);
  document.getElementById('next-page').addEventListener('click', onNextPage);
  
  getPDFobject(url).promise.then(function (pdf) {
      document.getElementById('page-count').textContent = pdf.numPages;
      pdfDoc = pdf;
      renderPage(1,adaptZoomHeight())
  });
}  

/**
 * Retourne une promise une fois que le pdf est chargé.
 * Cette promise contient un objet pdf qui sera réinjecté
 * @param {string} pdfPath Path of the pdf file
 */
function getPDFobject(pdfPath) {
   return pdfjsLib.getDocument(pdfPath);
}


/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param numPage Numéro de page.
 * @param zoom Echelle du document en pourcentage.
 */
function renderPage(numPage,zoom) {
  pageRendering = true;
  // Using promise to fetch the page
  pdfDoc.getPage(numPage).then(function(page) {

    //Parametres de visualisation
    pageNumPending = null,
    scale = zoom/100,
    canvas = document.getElementById(canvasId),
    ctx = canvas.getContext('2d');

    var viewport = page.getViewport({scale: scale});
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // On affiche le PDF dans le canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);
    
    // On attend la fin du rendu
    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        // Le rendu de la page est en cours
        renderPage(pageNumPending, currentZoom);
        pageNumPending = null;
      }
    });
  });
  
  // Mise ajour du nombre de pages
  document.getElementById('page-num').value = numPage;
  currentPage = numPage;

  // Mise ajour du zoom
  document.getElementById('zoom-num').value = zoom;
  currentZoom = zoom;
}

/**
 * Si une autre page est en cours de rendu, on attend la fin
 * Sinon on fait le nouveau rendu immédiatement
 */
function queueRenderPage(num, zoom) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num, zoom);
  }
}

/**
 * Affiche la page précédente.
 */
function onPrevPage() {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  queueRenderPage(currentPage, currentZoom);
}

/**
 * Affiche la page suivante.
 */
function onNextPage() {
  if (currentPage >= pdfDoc.numPages) {
    return;
  }
  currentPage++;
  queueRenderPage(currentPage, currentZoom);
}

/**
 * Affiche la page donnée en paramètre
 */
function onInputPage() {
  var newPage = parseInt(document.getElementById("page-num").value);
  if (!Number.isInteger(newPage) || newPage < 1 || newPage > pdfDoc.numPages) {
    return;
  }
  currentPage = newPage;
  queueRenderPage(currentPage, currentZoom);
}

/**
 * Zoome sur le document
 */
function onZoomIn() {
  currentZoom += 10;
  queueRenderPage(currentPage, currentZoom);
}

/**
 * Dézoome sur le document
 */
function onZoomOut() {
  if (currentZoom <= 10) {
    currentZoom = 1
  }
  else{
    currentZoom -= 10;
  }
  queueRenderPage(currentPage, currentZoom);
}

/**
 * Zoome en fonction de la valeur donnée en paramètre
 */
function onInputZoom() {
  var newZoom = Number(document.getElementById("zoom-num").value);
  if (Number.isNaN(newZoom) || newZoom < 1) {
    return;
  }
  currentZoom = newZoom;
  queueRenderPage(currentPage, newZoom);
}

/**
 * Ajuste l'echelle du document par rapport a la largeur du viewer
 */
function adaptZoomWidth() {
  var divSize = document.getElementById("pdfViewer").clientWidth; 
  var canvasSize = document.getElementById(canvasId).clientWidth; 
  var newZoom = 80/(canvasSize/divSize);
  if (Number.isNaN(newZoom) || newZoom < 1) {
    return;
  }
  currentZoom = newZoom;
  return currentZoom;
  //queueRenderPage(currentPage, newZoom);
}

/**
 * Ajuste l'echelle du document par rapport a la hauteur du viewer
 */
function adaptZoomHeight() {
  var divSize = document.getElementById("pdfViewer").clientHeight; 
  var canvasSize = document.getElementById(canvasId).clientHeight; 
  var newZoom = 80/(canvasSize/divSize);
  if (Number.isNaN(newZoom) || newZoom < 1) {
    return;
  }
  currentZoom = newZoom;
  return currentZoom;
  //queueRenderPage(currentPage, newZoom);
}


function printPDF() {

}