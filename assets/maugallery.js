(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    prevImage() {
      let activeImage = $(".lightboxImage").attr("src");
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
    
      if (activeTag === "all") {
        $(".item-column img").each(function() {
          imagesCollection.push($(this)); // Ajouter l'élément img lui-même à la collection
        });
      } else {
        $(".item-column img[data-gallery-tag='" + activeTag + "']").each(function() {
          imagesCollection.push($(this)); // Ajouter l'élément img lui-même à la collection
        });
      }
    
      let currentIndex = imagesCollection.findIndex(function(element) {
        return element.attr("src") === activeImage;
      });
    
      let prevIndex = (currentIndex - 1 + imagesCollection.length) % imagesCollection.length;
      let prevImage = imagesCollection[prevIndex];
      $(".lightboxImage").attr("src", prevImage.attr("src"));
    },
    nextImage() {
      // Recherche de l'image active
      let activeImage = $(".lightboxImage").attr("src");
    
      // Récupération du tag actif
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
    
      // Création de la collection d'images
      let imagesCollection = [];
    
      // Construction de imagesCollection en fonction du tag actif
      if (activeTag === "all") {
        $(".item-column img").each(function() {
          imagesCollection.push($(this)); // Ajouter l'élément img lui-même à la collection
        });
      } else {
        $(".item-column img[data-gallery-tag='" + activeTag + "']").each(function() {
          imagesCollection.push($(this)); // Ajouter l'élément img lui-même à la collection
        });
      }
    
      // Recherche de l'index de l'image active dans imagesCollection
      let currentIndex = imagesCollection.findIndex(function(element) {
        return element.attr("src") === activeImage;
      });
    
      // Calcul de l'index de l'image suivante
      let nextIndex = (currentIndex + 1) % imagesCollection.length;
    
      // Récupération de l'image suivante
      let nextImage = imagesCollection[nextIndex];
    
      // Mise à jour de la lightbox avec l'image suivante
      $(".lightboxImage").attr("src", nextImage.attr("src"));
    },
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    //Le code ci dessous sert au ScreenReader
    
    // Sélection de toutes les images dans la galerie
    let images = gallery.find('img');

    // Gestion de l'événement au clic sur une image
    images.on('click', function() {
    let altText = $(this).attr('alt'); // Récupération du texte alternatif de l'image cliquée
    $('.lightboxImage').attr('alt', altText); // Attribution du texte alternatif à l'image affichée dans la modale
  });

    },
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);

// Sélectionner toutes les balises img
let images = document.querySelectorAll('img');

// Filtrer les images avec une source contenant .jpg ou .jpeg
let jpgImages = Array.from(images).filter(function(image) {
    return image.src.toLowerCase().includes('.jpg') || image.src.toLowerCase().includes('.jpeg');
});

// Récupérer les URLs des images jpg
let urlsToCache = jpgImages.map(function(image) {
    return image.src;
});

// Mise en cache des URLs récupérées
caches.open('images-cache').then(function(cache) {
    return Promise.all(
        urlsToCache.map(function(url) {
            return cache.add(url);
        })
    );
}).then(function() {
    console.log('Toutes les images jpg ont été mises en cache avec succès.');
}).catch(function(error) {
    console.error('Une erreur est survenue lors de la mise en cache des images jpg:', error);
});
