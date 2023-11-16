   /**
/ * SMOOOTH SCROLL
 */

let smoothscroll;
const ease = 0.1;
const body = document.body;

{

    function offset(el) {
        var rect = el.getBoundingClientRect(),
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return rect.top + scrollTop;
    }
    
    function smoothScrollFunction() {


        if ( $(window).innerWidth() > 1024 ) {
        // -----------------------------------------------------------------------------------------

        const sticky = document.querySelector('.sticky'),
              parent = document.querySelector('.sticky-parent');
        
        // helper functions
        const MathUtils = {
            // map number x from range [a, b] to [c, d]
            map: (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c,
            // linear interpolation
            lerp: (a, b, n) => (1 - n) * a + n * b,
        };
        // calculate the viewport size
        let winsize;
        const calcWinsize = () => winsize = { width: window.innerWidth, height: window.innerHeight };
        calcWinsize();
        // and recalculate on resize
        window.addEventListener('resize', calcWinsize);

        // scroll position
        let docScroll;
        // for scroll speed calculation
        let lastScroll;
        let scrollingSpeed = 0;
        // scroll position update function
        const getPageYScroll = () => docScroll = window.pageYOffset || document.documentElement.scrollTop;
        window.addEventListener('scroll', getPageYScroll);

        // Item
        class Item {
            constructor(el) {
                // the .item element
                this.DOM = { el: el };
                // the inner image
                this.DOM.child = this.DOM.el.querySelector('[data-px]');
                // this.DOM.imageWrapper = this.DOM.image.parentNode;
                // this.DOM.title = this.DOM.el.querySelector('.content__item-title');
                this.renderedStyles = {
                    // here we define which property will change as we scroll the page and the item is inside the viewport
                    // in this case we will be:
                    // - translating the inner image
                    // we interpolate between the previous and current value to achieve a smooth effect
                    translationY: {
                        // interpolated value
                        previous: 0,
                        // current value
                        current: 0,
                        // amount to interpolate
                        ease: ease,
                        // current value setter
                        setValue: () => {
                            // the maximum value to translate the image is set in a CSS variable (--overflow)
                            // const toValue = parseInt(getComputedStyle(this.DOM.image).getPropertyValue('--overflow'), 10);
                            // const fromValue = -1 * toValue;
                            // return Math.max(Math.min(MathUtils.map(this.props.top - docScroll, winsize.height, -1 * this.props.height, fromValue, toValue), toValue), fromValue);

                            const fromValue = parseInt(this.DOM.child.getAttribute('data-px-top'), 10);
                            const toValue = parseInt(this.DOM.child.getAttribute('data-px-bottom'), 10);


                            if (toValue < fromValue) {
                                return Math.max(Math.min(MathUtils.map(this.props.top - docScroll, winsize.height, -1 * this.props.height, fromValue, toValue), fromValue), toValue);
                            } else {
                                return Math.max(Math.min(MathUtils.map(this.props.top - docScroll, winsize.height, -1 * this.props.height, fromValue, toValue), toValue), fromValue);
                            }

                        }
                    },
                };
                // gets the item's height and top (relative to the document)
                // this.getSize();
                // set the initial values
                this.update();
                // use the IntersectionObserver API to check when the element is inside the viewport
                // only then the element styles will be updated
                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => this.isVisible = entry.intersectionRatio > 0);
                });
                this.observer.observe(this.DOM.el);
                // init/bind events
                this.initEvents();
            }
            update() {
                // gets the item's height and top (relative to the document)
                this.getSize();
                // sets the initial value (no interpolation)
                for (const key in this.renderedStyles) {
                    this.renderedStyles[key].current = this.renderedStyles[key].previous = this.renderedStyles[key].setValue();
                }
                // apply changes/styles
                this.layout();
            }
            getSize() {
                const rect = this.DOM.el.getBoundingClientRect();
                this.props = {
                    // item's height
                    height: rect.height,
                    // offset top relative to the document
                    top: docScroll + rect.top
                }
            }
            initEvents() {
                window.addEventListener('resize', () => this.resize());
            }
            resize() {
                // gets the item's height and top (relative to the document)
                // this.getSize();
                // on resize reset sizes and update styles
                this.update();
            }
            render() {
                // update the current and interpolated values
                for (const key in this.renderedStyles) {
                    this.renderedStyles[key].current = this.renderedStyles[key].setValue();
                    this.renderedStyles[key].previous = MathUtils.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].ease);
                }

                // and apply changes
                this.layout();
            }
            layout() {
                // translates the image
                this.DOM.child.style.transform = `translate3d(0,${this.renderedStyles.translationY.previous}px,0)`;

            }
        }
 
        // SmoothScroll
        class SmoothScroll {
            constructor() {
                // the <main> element
                this.DOM = { main: document.querySelector('.scroll-wrapper') };
                // the scrollable element
                // we translate this element when scrolling (y-axis)
                this.DOM.scrollable = this.DOM.main.querySelector('div[data-scroll]');
                // the items on the page
                this.items = [];
                // this.DOM.content = this.DOM.main.querySelector('.content');
                [...this.DOM.main.querySelectorAll('.px')].forEach(item => this.items.push(new Item(item)));
                // here we define which property will change as we scroll the page
                // in this case we will be translating on the y-axis
                // we interpolate between the previous and current value to achieve the smooth scrolling effect
                this.renderedStyles = {
                    translationY: {
                        // interpolated value
                        previous: 0,
                        // current value
                        current: 0,
                        // amount to interpolate
                        ease: ease,
                        // current value setter
                        // in this case the value of the translation will be the same like the document scroll
                        setValue: () => docScroll
                    }
                };
                // set the body's height
                this.setSize();
                // set the initial values
                this.update();
                // the <main> element's style needs to be modified
                this.style();
                // init/bind events
                this.initEvents();
                // start the render loop
                requestAnimationFrame(() => this.render());
            }
            update() {
                // sets the initial value (no interpolation) - translate the scroll value
                for (const key in this.renderedStyles) {
                    this.renderedStyles[key].current = this.renderedStyles[key].previous = this.renderedStyles[key].setValue();
                }
                // translate the scrollable element
                this.layout();

            }
            layout() {
                this.DOM.scrollable.style.transform = `translate3d(0,${-1*this.renderedStyles.translationY.previous}px,0)`;
            }
            setSize() {
                // set the heigh of the body in order to keep the scrollbar on the page
                body.style.height = `${this.DOM.scrollable.scrollHeight}px`;
            }
            style() {
                // the <main> needs to "stick" to the screen and not scroll
                // for that we set it to position fixed and overflow hidden 
                this.DOM.main.style.position = 'fixed';
                this.DOM.main.style.width = this.DOM.main.style.height = '100%';
                this.DOM.main.style.top = this.DOM.main.style.left = 0;
                this.DOM.main.style.overflow = 'hidden';
            }
            initEvents() {
                // on resize reset the body's height
                window.addEventListener('resize', () => this.setSize());

            }
            render() {

                // Get scrolling speed
                // scrollingSpeed = Math.abs(docScroll - lastScroll);

                // HEADER    
                if (docScroll > 10) {
                    body.classList.add('nav-scroll');
                } else {
                    body.classList.remove('nav-scroll');
                }
                if (docScroll > 10) {
                    body.classList.add('hide-scroll');
                } else {
                    body.classList.remove('hide-scroll');
                }

                if (docScroll > winsize.height ) {
                    body.classList.add('nav-blend');
                } else {
                    body.classList.remove('nav-blend');
                }

            




                $('.career-title-repere').each(function(){
                   var scrollTop     = $(window).scrollTop(),
                    elementOffset = $(this).offset().top,
                    distance      = (elementOffset - scrollTop);
                    // console.log('tezt ' + distance);
                    if ( distance > 0 ) {
                        $('.a-icone-career').css('opacity', '0');
                        $('.a-icone-career .icone').css('top', '60%');
                    } else {
                        $('.a-icone-career').css('opacity', '1');
                        $('.a-icone-career .icone').css('top', '50%');
                    }
                });

                // STICKY
                
                if (document.body.contains(sticky)) {
                    let parentOffset = offset(parent),
                        parentHeight = parent.offsetHeight,
                        stickyHeight = sticky.offsetHeight;
                    if(docScroll <= parentOffset) {
                        sticky.style.position = '';
                        sticky.style.bottom = '';
                        sticky.style.top = '';
                        $('.a-icone-career').addClass('fixe');
                    }
                    else if(docScroll > parentOffset) {
                        sticky.style.position = 'absolute';
                        $('.a-icone-career').removeClass('fixe');
                        if(docScroll > (parentHeight + parentOffset - stickyHeight)) {
                            sticky.style.top = 'auto';
                            sticky.style.bottom = 0;
                        }
                        else {
                            sticky.style.top = (docScroll - parentOffset)+'px';
                            sticky.style.bottom = 'auto';
                        }
                    }
                    else {
                        $('.a-icone-career').removeClass('fixe');
                    }
                }

                // Update lastScroll

                lastScroll = docScroll;

                // update the current and interpolated values
                for (const key in this.renderedStyles) {
                    this.renderedStyles[key].current = this.renderedStyles[key].setValue();
                    this.renderedStyles[key].previous = MathUtils.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].ease);
                }
                // and translate the scrollable element
                this.layout();

                // for every item
                for (const item of this.items) {
                    // if the item is inside the viewport call it's render function
                    // this will update item's styles, based on the document scroll value and the item's position on the viewport
                    // if (item.isVisible) {
                    //     if (item.insideViewport) {
                    //         item.render();
                    //     } else {
                    //         item.insideViewport = true;
                    //         item.update();
                    //     }
                    // } else {
                    //     item.insideViewport = false;
                    // }
                    if ( item.isVisible ) {
                        item.render();
                    }
                }

                // REPLACE AOS
                const SELECTOR_AOS = '[data-aos]';
                const ANIMATE_CLASS_NAME_AOS = 'aos-animate';

                const animateAos = element => (
                    element.classList.add(ANIMATE_CLASS_NAME_AOS)
                );

                const isAnimatedAos = element => (
                    element.classList.contains(ANIMATE_CLASS_NAME_AOS)
                );

                const intersectionObserverAos = new IntersectionObserver((entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.intersectionRatio > 0) {
                            animateAos(entry.target);
                        }
                        observer.unobserve(entry.target);
                        // !!!
                        setTimeout(function() {
                            smoothscroll.setSize();
                        }, 1001);
                    });
                });
                const elementsAos = [].filter.call(
                    document.querySelectorAll(SELECTOR_AOS),
                    element => !isAnimatedAos(element, ANIMATE_CLASS_NAME_AOS),
                );
                elementsAos.forEach((element) => intersectionObserverAos.observe(element));





               
                // STICKY
                
                if (document.body.contains(sticky)) {
                    let parentOffset = offset(parent),
                        parentHeight = parent.offsetHeight,
                        stickyHeight = sticky.offsetHeight;
                    if(docScroll <= parentOffset) {
                        sticky.style.position = '';
                        sticky.style.bottom = '';
                        sticky.style.top = ''
                    }
                    else if(docScroll > parentOffset) {
                        sticky.style.position = 'absolute';
                        if(docScroll > (parentHeight + parentOffset - stickyHeight)) {
                            sticky.style.top = 'auto';
                            sticky.style.bottom = 0;
                        }
                        else {
                            sticky.style.top = (docScroll - parentOffset)+'px';
                            sticky.style.bottom = 'auto';
                        }
                    }
                }

                // loop..
                requestAnimationFrame(() => this.render());
            }
        }

        /***********************************/
        /********** Preload stuff **********/

        // Preload images
        const preloadImages = () => {
            return new Promise((resolve, reject) => {
                imagesLoaded(document.querySelectorAll('img'), { background: true }, resolve);
            });
        };

        // And then..
        preloadImages().then(() => {
            // Get the scroll position and update the lastScroll variable
            getPageYScroll();
            lastScroll = docScroll;
            // Initialize the Smooth Scrolling
            smoothscroll = new SmoothScroll();
            // INIT AOS
            
        });
    }

    }

    // ---------------------------------------------------------------------------------------------

} 

if ( $(window).innerWidth() > 1024 ) {
    smoothScrollFunction();
}

function no_smooth_scroll_mobile() {
    const SELECTOR_AOS = '[data-aos], .sa, .saV2, .js-increment';
    const ANIMATE_CLASS_NAME_AOS = 'aos-animate';

    const animateAos = element => (
        element.classList.add(ANIMATE_CLASS_NAME_AOS)
    );

    const isAnimatedAos = element => (
        element.classList.contains(ANIMATE_CLASS_NAME_AOS)
    );

    const intersectionObserverAos = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
                animateAos(entry.target);
            }
            if (entry.target.classList.contains('js-increment')) {
                $(entry.target).numberIncrementer({});
            }
            observer.unobserve(entry.target);
        });
    });
    const elementsAos = [].filter.call(
        document.querySelectorAll(SELECTOR_AOS),
        element => !isAnimatedAos(element, ANIMATE_CLASS_NAME_AOS),
    );
    elementsAos.forEach((element) => intersectionObserverAos.observe(element));

    // -----------------------------------------------------------------------------
    // --- CHECK SCROLL POSITION
    // -----------------------------------------------------------------------------

    var lastScrollTop = 0;

    function checkScrollPosition() {

        var st = $(this).scrollTop(); // Last Scroll Value       

        // TOP OR NOT
        if (st < 1) {
            $('body').addClass('scrollTop');
        } else {
            $('body').removeClass('scrollTop');
        }

        // UP OR DOWN
        if (st < lastScrollTop) {
            $('body').addClass('scrollUp').removeClass('scrollDown');
        } else {
            $('body').removeClass('scrollUp').addClass('scrollDown');
        }

        lastScrollTop = st; // New Scroll Value  

    } checkScrollPosition();

    $(window).scroll(function() {
        checkScrollPosition();
    });

}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// --- REMPLACE AOS
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

function aos() {
    const SELECTOR_AOS = '[data-aos], .sa, .saV2, .js-increment';
    const ANIMATE_CLASS_NAME_AOS = 'aos-animate';
    const animateAos = element => (
      element.classList.add(ANIMATE_CLASS_NAME_AOS)
    );
    const isAnimatedAos = element => (
      element.classList.contains(ANIMATE_CLASS_NAME_AOS)
    );
    const intersectionObserverAos = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
            let entryHeight = entry.target.offsetHeight;
            animateAos(entry.target);
            if(entry.target.classList.contains('js-increment')) {
                $(entry.target).numberIncrementer({});
            }
            observer.unobserve(entry.target);
        }
      });
    });
    const elementsAos = [].filter.call(
      document.querySelectorAll(SELECTOR_AOS),
      element => !isAnimatedAos(element, ANIMATE_CLASS_NAME_AOS),
    );
    elementsAos.forEach((element) => intersectionObserverAos.observe(element));
}

































    function triggerFunctions() {

 
        $('h1').widowFix();
        $('.widowFix').widowFix();


        // -----------------------------------------------------------------------------
        // --- HAUTEUR HEADER A 100% DE L ECRAN
        // -----------------------------------------------------------------------------
       
        $('.generic-header').each(function(){
            $(this).css('height', $(window).innerHeight());
        });

       // -----------------------------------------------------------------------------
        // --- SPLIT TEXTES LINES
        // -----------------------------------------------------------------------------

        // if ( $('main').hasClass('main-singleteam') ) {
        //     $chapeaux = $('.quote-box');
        //     var textSplitLines = new SplitText($chapeaux, { type: "lines", linesClass: "line" });
        // }
            
        // if ( $('main').hasClass('st') ) {
        //     $titres = $('.split-title');
        //     // alert('ok')
        //     var textSplitLines = new SplitText($titres, { type: "lines", linesClass: "line" });
        // }

        // if ( $('main').hasClass('sc') || $('main').hasClass('st') ) {
        //     $lines = $('.line');
        //     var textSplitLines = new SplitText($lines, { type: "lines", linesClass: "subline" });
        // }


    $('.menu-toggle').click(function(e) {
        e.preventDefault();
        $('body').toggleClass('menu-open');
    });



    $('.checkHeight .item').each(function(){ 

        var hauteur1 = $('.checkHeight .item-1 .cp').innerHeight();
        var hauteur2 = $('.checkHeight .item-2 .cp').innerHeight();
        var hauteur3 = $('.checkHeight .item-3 .cp').innerHeight(); 
        var nouvelleHauteur = hauteur1;
        if ( hauteur2 > hauteur1 ) {
            nouvelleHauteur = hauteur2;
        }
        if ( hauteur3 > hauteur2 ) {
            nouvelleHauteur = hauteur3;
        } 


        $(this).find('.cp').css('height', nouvelleHauteur);
    });





// if ( ) {

//     var swiperHN = new Swiper('.swiper-homenews', {

//       slidesPerView: 2,
//       centeredSlides: false,
//       spaceBetween: 50,
//       pagination: {
//         el: '.swiper-pg',
//         type: 'fraction',
//       },
//       navigation: {
//         nextEl: '.sbn',
//         prevEl: '.sbp',
//       },
//       breakpoints: {
     
//         767: {
//           slidesPerView: 1,
//           spaceBetween: 15,
//           // init: true,
//         },
//         1024: {
//           slidesPerView: 2,
//           spaceBetween: 50,
//           // init: true,
//         },
//       }
//     });

//     var swiperHNP = new Swiper('.swiper-homenews-progressbar', {

//       slidesPerView: 2,
//       centeredSlides: false,
//       spaceBetween: 50,
//       pagination: {
//         el: '.swiper-progressbar',
//         type: 'progressbar',
//       }, 
//       breakpoints: {
     
//         767: {
//           slidesPerView: 1,
//           spaceBetween: 40,
//           // init: true,
//         },
//         1024: {
//           slidesPerView: 2,
//           spaceBetween: 50,
//           // init: true,
//         },
//       }
//     });

// }

if ( $('main').hasClass('main-about') || $('main').hasClass('main-management') || $('main').hasClass('main-properties') ) {

    var swiperHN = new Swiper('.swiper-homenews', {

      slidesPerView: 2,
      centeredSlides: false,
      spaceBetween: 50,
      grabCursor: true,
      pagination: {
        el: '.swiper-pg',
        type: 'fraction',
      },
      navigation: {
        nextEl: '.sbn',
        prevEl: '.sbp',
      },
      breakpoints: {
     
        767: {
          slidesPerView: 1,
          spaceBetween: 15,
          // init: true,
        },
        1024: {
          slidesPerView: 'auto',
          spaceBetween: 50,
          // init: true,
        },
      }
    });

    var swiperHNP = new Swiper('.swiper-homenews-progressbar', {

      slidesPerView: 2,
      centeredSlides: false,
      spaceBetween: 50,
      pagination: {
        el: '.swiper-progressbar',
        type: 'progressbar',
      }, 
      breakpoints: {
     
        767: {
          slidesPerView: 1,
          spaceBetween: 40,
          // init: true,
        },
        1024: {
          slidesPerView: 'auto',
          spaceBetween: 50,
          // init: true,
        },
      }
    });

}


if ( $('main').hasClass('main-about') || $('main').hasClass('main-properties') || $('main').hasClass('main-management') ) {
    swiperHN.controller.control = swiperHNP;
    swiperHNP.controller.control = swiperHN;
}








    var swiperHN = new Swiper('.swiper-rm', {

      slidesPerView: 2,
      centeredSlides: false,
      spaceBetween: 50,
      grabCursor: true,
      // pagination: {
      //   el: '.swiper-pg',
      //   type: 'fraction',
      // },
      // navigation: {
      //   nextEl: '.sbn',
      //   prevEl: '.sbp',
      // },
      breakpoints: {
     
        767: {
          slidesPerView: 1,
          spaceBetween: 15,
          // init: true,
        },
        1024: {
          slidesPerView: 'auto',
          spaceBetween: 50,
          // init: true,
        },
      }
    });








    var swiperHNE = new Swiper('.swiper-se', {

      slidesPerView: 'auto',
      centeredSlides: false,
      spaceBetween: 50,
      grabCursor: true,
      pagination: {
        el: '.swiper-pg',
        type: 'fraction',
      },
      navigation: {
        nextEl: '.sbn',
        prevEl: '.sbp',
      },
      breakpoints: {
     
        767: { 
          spaceBetween: 15,
          // init: true,
        },
        1024: { 
          spaceBetween: 50,
          // init: true,
        },
      }
    });

    var swiperHNPE = new Swiper('.swiper-se-progressbar', {

      slidesPerView: 'auto',
      centeredSlides: false,
      spaceBetween: 50,
      pagination: {
        el: '.swiper-progressbar',
        type: 'progressbar',
      }, 
      breakpoints: {
     
        767: { 
          spaceBetween: 40,
          // init: true,
        },
        1024: { 
          spaceBetween: 50,
          // init: true,
        },
      }
    });


if ( $('body').hasClass('single-estates') ) {
    swiperHNE.controller.control = swiperHNPE;
    swiperHNPE.controller.control = swiperHNE;
}




// if ( $(window).innerWidth() < 1024 ) {
//  var swiper = new Swiper('.swiper-singlenews', {
//       // slidesPerView: 1,
//       // spaceBetween: 10,
//       // init: false, 
//       pagination: {
//         el: '.swiper-pg',
//         type: 'fraction',
//       },
//       navigation: {
//         nextEl: '.sbn',
//         prevEl: '.sbp',
//       },
//       breakpoints: {
     
//         767: {
//           slidesPerView: 1,
//           spaceBetween: 40,
//           // init: true,
//         },
//         1024: {
//           slidesPerView: 2,
//           spaceBetween: 50,
//           // init: true,
//         },
//       }
//     });
//     }




$('.shave').dotdotdot(); 

















$(function() {

    var filters = $('#filter');

    // CHAMPS NUMERAIRES

    var rangeSliders = document.getElementsByClassName('range-slider');

    for ( var i = 0; i < rangeSliders.length; i++ ) {
        var minEl = rangeSliders[i].nextElementSibling,
            maxEl = rangeSliders[i].nextElementSibling.nextElementSibling,
            minInt = parseInt(minEl.value,10),
            maxInt = parseInt(maxEl.value,10),
            maxCurr = parseInt(maxEl.dataset.max,10),
            step = parseInt(rangeSliders[i].dataset.step,10);

        noUiSlider.create(rangeSliders[i], {
            start: [minInt, maxInt],
            step: step,
            connect: true,
            range: {
                'min': 0,
                'max': maxCurr
            },
            format: wNumb({
                decimals: 0,
            })
        });

        rangeSliders[i].noUiSlider.on('update', function (values, handle) {
            var value = values[handle],
                minEl = this.target.nextElementSibling,
                maxEl = this.target.nextElementSibling.nextElementSibling;


                // console.log(minEl + '//' + maxEl)

            if (handle) {
                maxEl.value = value;
            } else {
                minEl.value = value;
            }
            ajax_count_results();
        });
        // minEl.addEventListener('change', function () {
        //     this.target.noUiSlider.set([this.value, null]);
        // });

        // maxEl.addEventListener('change', function () {
        //     this.target.noUiSlider.set([null, this.value]);
        // });

    }





// console.log(priceMaxBase)



    var filtersReset = $('.filters-reset');
    
    filtersReset.click(function() {

        var oldUrl = location.href.split('?')[0];
        var oldUrlClean = oldUrl.toString().replace( /\/page\/\d+\//g, "/" );

        var newUrl = new URL(oldUrlClean);
        var searchParams = new URLSearchParams();

        var status = $('.input-status').val();

        searchParams.set('estate_status', status);

        newUrl.search = searchParams.toString();   

        history.replaceState(null, null, newUrl.toString());

        $("input").prop("checked", false);

        //RESET RANGE
        for ( var i = 0; i < rangeSliders.length; i++ ) {
            var maxEl = rangeSliders[i].nextElementSibling.nextElementSibling,
            maxCurr = parseInt(maxEl.dataset.max,10);

            rangeSliders[i].noUiSlider.set([0, maxCurr]);
        }


                $('body').removeClass('show-reset-filter');
                $('body').removeClass('show-reset-filter-2');

        ajax_count_results();

        $.get( newUrl.toString(), function( response ) {

            var newContainer = $( response );


            $('.archives-item').each(function(){
                $(this).css('opacity','0');
            });
         

            setTimeout(function() {
                $('html, body').animate( { scrollTop: 0 }, 250 ); 
            }, 500) 
            setTimeout(function() {
                $('#ajax-container').html( newContainer.find('#ajax-container').html() );
            }, 750)

            setTimeout(function() {
                smoothScrollFunction();
            }, 770)

            // $('#ajax-container').html( newContainer.find('#ajax-container').html() );

        } );
        
            

    });

    filters.submit(function(){

        var oldUrl = location.href.split('?')[0];
        var oldUrlClean = oldUrl.toString().replace( /\/page\/\d+\//g, "/" );
        console.log(oldUrlClean);

        var newParams= '';
        var types = '';

        var arrayQuery = filters.serializeArray();





            // $('.archives-item').each(function(){
            //     setTimeout(function() { 
            //         // $(this).css('opacity','1');
            //     }, 750)
            // });




        roomsMinBase = $('#rooms-range-slider').parent().find('.range-min').val();
        roomsMaxBase = $('#rooms-range-slider').parent().find('.range-max').data("max");
        priceMinBase = $('#price-range-slider').parent().find('.range-min').val();
        priceMaxBase = $('#price-range-slider').parent().find('.range-max').data("max");
        surfaceMinBase = $('#surface-range-slider').parent().find('.range-min').val();
        surfaceMaxBase = $('#surface-range-slider').parent().find('.range-max').data("max");

        if ( roomsMin > '0.5' || priceMin > '0.5' || surfaceMin > '0.5' || roomsMax < roomsMaxBase || priceMax < priceMaxBase || surfaceMax < surfaceMaxBase ) {
            console.log('filtre est actif');
            $('body').addClass('show-reset-filter');
        } else {
            $('body').removeClass('show-reset-filter');
        }

        $('#filter label input').each(function(){
            if ( $(this)[0].checked === true ) {
                // console.log('OK type')
                 console.log('filtre est actif');
                 $('body').addClass('show-reset-filter-2'); 
                 // break();
                 return false;
            } else {
                $('body').removeClass('show-reset-filter-2');
            }
        });









        var newUrl = new URL(oldUrlClean);
        var searchParams = new URLSearchParams();

        $.each(arrayQuery, function(i, field) { 
            
            if(searchParams.has(field.name)){
                searchParams.set(field.name, searchParams.get(field.name)+','+field.value);
            }
            else {
                if (field.name == 'price_max') {
                    searchParams.set('price_range', searchParams.get('price_range')+','+field.value);
                }
                else if (field.name == 'indoor_surface_max') {
                    searchParams.set('indoor_surface_range', searchParams.get('indoor_surface_range')+','+field.value);
                }
                else if (field.name == 'nb_rooms_max') {
                    searchParams.set('nb_rooms_range', searchParams.get('nb_rooms_range')+','+field.value);
                }
                else {
                    if(field.name !== 'action')
                        searchParams.set(field.name, field.value);
                }
            }
        });   

        newUrl.search = searchParams.toString();      

        history.replaceState(null, null, newUrl.toString());
        $.get( newUrl.toString(), function( response ) {

            var newContainer = $( response );


            $('.archives-item').each(function(){
                $(this).css('opacity','0');
            });
         

            setTimeout(function() {
                $('html, body').animate( { scrollTop: 0 }, 250 ); 
            }, 500)

         // alert('ok')

            setTimeout(function() {
                $('#ajax-container').html( newContainer.find('#ajax-container').html() );
            }, 750)

            setTimeout(function() { 
                smoothScrollFunction();
            }, 760)


        } );
        //CANCEL SUBMIT BEHAVIOUR
        return false;
    });

    filters.find('input').on('change', ajax_count_results);

    function ajax_count_results() {
        var data = {};
        var arrayQuery = filters.serializeArray();
        $.each(arrayQuery, function(i, field) { 
            
            if(data[field.name]){
                data[field.name] = data[field.name]+','+field.value
            }
            else {
                if (field.name == 'price_max') {
                    data['price_range'] = data['price_range']+','+field.value
                }
                else if (field.name == 'indoor_surface_max') {
                    data['indoor_surface_range'] = data['indoor_surface_range']+','+field.value
                }
                else if (field.name == 'nb_rooms_max') {
                    data['nb_rooms_range'] = data['nb_rooms_range']+','+field.value
                }
                else {
                    data[field.name] = field.value   
                }
            }
        }); 
        console.log(data);

        // recopie valeur des ranges

        roomsMin = $('#rooms-range-slider').parent().find('.range-min').val();
        roomsMax = $('#rooms-range-slider').parent().find('.range-max').val();
        priceMin = $('#price-range-slider').parent().find('.range-min').val();
        priceMax = $('#price-range-slider').parent().find('.range-max').val();
        surfaceMin = $('#surface-range-slider').parent().find('.range-min').val();
        surfaceMax = $('#surface-range-slider').parent().find('.range-max').val();
        $('.rrs').find('.min').find('span').html(roomsMin);
        $('.rrs').find('.max').find('span').html(roomsMax);
        $('.prs').find('.min').find('span').html(priceMin);
        $('.prs').find('.max').find('span').html(priceMax);
        $('.srs').find('.min').find('span').html(surfaceMin);
        $('.srs').find('.max').find('span').html(surfaceMax);


// console.log(priceMaxBase)





        // $('#filter #localisation label input').each(function(){
        //     if ( $(this)[0].checked ) {
        //         // console.log('OK loca') 
        //         console.log('filtre est actif');
        //         $('body').addClass('show-reset-filter');
        //     } else {
        //         $('body').removeClass('show-reset-filter');
        //     }
        // });
        
        $.post(siteScript.ajax_url, data, function(response) {  
            // console.log(response);
            $('.filters-results').html(response);
        });  
    }

});

// $('#articles').on('click', '#load-older-posts a', function(e) {
  
// // prevent new page load

//   e.preventDefault();
  
// // store next page number

//   var next_page = $(this).attr('href');
  
// // remove older posts button from DOM

//   $(this).remove();
  
// // ajax older posts below existing posts


// $('.shave').dotdotdot(); 

//   $('#articles').append(
//     $('<div />').load(next_page + ' #articles')
//   );
// });



        // -----------------------------------------------------------------------------
        // --- ANIMATED CLASS TOGGLE
        // -----------------------------------------------------------------------------   

        var mouseEnter = ((document.ontouchstart !== null) ? 'mouseenter' : 'touchstart');
        $('body').on("webkitAnimationEnd oanimationend msAnimationEnd animationend", '.anim-hover', function(){
            $(this).removeClass("animated"); 
        })
        .on(mouseEnter, '.anim-hover', function() {
            // alert('ok')
            $(this).addClass("animated");
        });














// window.onmousemove = suitsouris;
//         function suitsouris(evenement)
//         {
//             if(navigator.appName=="Microsoft Internet Explorer")
//             {
//                 var x = event.x+document.body.scrollLeft;
//                 var y = event.y+document.body.scrollTop;
//             }
//             else
//             {
//                 var x =  evenement.pageX;
//                 var y =  evenement.pageY;
//             }
//             $("#mouse-cursor").css('left',(x+1)+'px');
//             $("#mouse-cursor").css('top', (y+1)+'px');
//         }









//         $(".swiper-slide").mouseover(function() { 
//             $('body').addClass('ss-hovered'); 
//         }); 

//         $(".swiper-slide").mouseout(function() { 
//             $('body').removeClass('ss-hovered'); 
//         }); 


//         $("a, .sbp, .sbn").mouseover(function() { 
//             $('body').addClass('a-hovered'); 
//         }); 

//         $("a, .sbp, .sbn").mouseout(function() { 
//             $('body').removeClass('a-hovered'); 
//         }); 



        // -----------------------------------------------------------------------------
        // --- FORMULAIRES NEWSLETTER
        // -----------------------------------------------------------------------------

        // --- Hover sur le bouton

        $(".mc-field-group .button").mouseover(function() { 
            $(this).parent().addClass('hovered'); 
        }); 

        $(".mc-field-group .button").mouseout(function() { 
            $(this).parent().removeClass('hovered'); 
        }); 

        // --- Affiche texte du RGPD au focus

        $('.mc-field-group .email').focus(function(){
        	 console.log()
            $(this).parent().parent().parent().parent().parent().parent().parent().find('.rgpd-txt').addClass('showme');
        });


 
        // --- RGPD Boxes sous les formulaires - S'affiche au scroll / click  

        if ( $(window).innerWidth() > 1024 ) {
            $(".openRGPD").mouseover(function() { 
                $(this).addClass('hovered'); 
            }); 
            $(".openRGPD").mouseout(function() { 
                $(this).removeClass('hovered'); 
            }); 
            $(".txtRGPD").mouseout(function() { 
                $(this).parent().find('.openRGPD').removeClass('hovered'); 
            }); 
            $(".txtRGPD p").mouseout(function() { 
                $(this).parent().parent().find('.openRGPD').removeClass('hovered'); 
            }); 
        }

        if ( $(window).innerWidth() < 1025 ) {
            $(".openRGPD").click(function(e) {
                e.preventDefault(); 
                $('body').addClass('rgpd-open'); 
            });  
            $(".mobile-rgpd-bg").click(function(e) {
                e.preventDefault(); 
                $('body').removeClass('rgpd-open'); 
            });  
            $(".mobile-rgpd-txt .close").click(function(e) {
                e.preventDefault(); 
                $('body').removeClass('rgpd-open'); 
            });  
        }

		
		
		
		
		
		
		 
			
			


} triggerFunctions();










function onResizeFunctions() {





if ( $('body').hasClass('page-template-template-properties') ) { 

} else {

    $('.swiper-wrapper.about').each(function(){
        var h = $(this).innerHeight();
        // console.log(h)

        $(this).find('.item').css('height', h-50 + 'px');

    });


}





 

    if ( $(window).innerWidth() > 1024 ) { 
        $('.full-height').each(function(){  
            $(this).css('height', $(window).innerHeight() );
        });
    }

    if ( $(window).innerWidth() > 767 ) { 
        $('.full-height').each(function(){  

            var larg = Math.round( $('.home-ambition .bg').innerWidth() ); 

            var decGrid = Math.round( $('.home-ambition .bg').offset().left );  
            var newLarg = decGrid + larg;  
            $(this).find('.pre-bg').css("left", newLarg + 'px');
        });
    }




    $('.pgwfl').each(function(){
     
        if ( $(window).innerWidth() > 767 ) { 
      
            var decGrid = Math.round( $(this).find('.grid').offset().left );    
 
            $(this).find('.fleche').css("left", decGrid + 'px');
        }
 

    });

    

    $('.home-numbers').each(function(){


        if ( $(window).innerWidth() > 767 ) { 
    
            var repGrid = Math.round( $('.colEt').innerWidth() ); 

            var decGrid = Math.round( $(this).find('.grid').offset().left ); 
            var decGauche = Math.round( $(this).find('.grid').offset().left ); 
            var larg = Math.round( $(this).find('.grid').innerWidth() ); 
            var newLarg = decGrid;  
            $(this).find('.pre-bg').css("left", newLarg + 'px');
            // $(this).find('.content').css("left", decGauche + 'px');
        }


        if ( $(window).innerWidth() > 1024 ) { 
    
            var repGrid = Math.round( $('.colEt').innerWidth() ); 

            var decGrid = Math.round( $(this).find('.grid').offset().left ); 
            var decGauche = Math.round( $(this).find('.grid').offset().left ); 
            var larg = Math.round( $(this).find('.grid').innerWidth() ); 
            var newLarg = decGrid+repGrid;  
            $(this).find('.pre-bg').css("left", newLarg + 'px');
            // $(this).find('.content').css("left", decGauche + 'px');
        }


    });

    $('.sub-page-header ').each(function(){
     
        if ( $(window).innerWidth() > 767 ) { 
            var decGrid = Math.round( $(this).find('.grid').offset().left );   
            var thisW = $(this).find('.right.image-big .pre-bg').innerWidth();
            // var newLarg = ( $(window).innerWidth() - decGrid);   
            // $(this).find('.content').css("right", decGrid + 'px');
            // alert('ok')
            var nL = decGrid + thisW;
            $(this).find('.right.image-big .pre-bg').css("width", nL + 'px');
        }

        // if ( $(window).innerWidth() > 1023 && $(window).innerWidth() < 1366 ) { 
        //     var decGrid = Math.round( $(this).find('.grid').offset().left ); 
        //     var newDec = decGrid+36+36;              
        //     var newLarg = ( $(window).innerWidth() - decGrid);   
        //     var newLarg2 = newLarg - 36 - 36;   
        //     $(this).find('.content').css("right", newDec + 'px');
        //     $(this).find('.content').css("width", newLarg2 + 'px');
        // }

        // if ( $(window).innerWidth() > 1365 ) { 
        //     var decGrid = Math.round( $(this).find('.grid').offset().left ); 
        //     var newDec = decGrid+51+51+51+51+51;              
        //     var newLarg = ( $(window).innerWidth() - decGrid);   
        //     var newLarg2 = newLarg - 51 - 51 - 51 - 51 - 51;   
        //     $(this).find('.content').css("right", newDec + 'px');
        //     $(this).find('.content').css("width", newLarg2 + 'px');
        // }


    });

    $('.about-team').each(function(){
     
        if ( $(window).innerWidth() > 767 && $(window).innerWidth() < 1025 ) { 
            var decGrid = Math.round( $(this).find('.grid').offset().left );               
            var newLarg = ( $(window).innerWidth() - decGrid);   
            $(this).find('.content').css("right", decGrid + 'px');
            $(this).find('.content').css("width", newLarg + 'px');
        }

        if ( $(window).innerWidth() > 1024 && $(window).innerWidth() < 1366 ) { 
            var decGrid = Math.round( $(this).find('.grid').offset().left ); 
            var newDec = decGrid+36+36;              
            var newLarg = ( $(window).innerWidth() - decGrid);   
            var newLarg2 = newLarg - 36 - 36;   
            $(this).find('.content').css("right", newDec + 'px');
            $(this).find('.content').css("width", newLarg2 + 'px');
        }

        if ( $(window).innerWidth() > 1365 ) { 
            var decGrid = Math.round( $(this).find('.grid').offset().left ); 
            var newDec = decGrid+51+51+51+51+51;              
            var newLarg = ( $(window).innerWidth() - decGrid);   
            var newLarg2 = newLarg - 51 - 51 - 51 - 51 - 51;   
            $(this).find('.content').css("right", newDec + 'px');
            $(this).find('.content').css("width", newLarg2 + 'px');
        }


    });

    $('.about-bureaux').each(function(){
        if ( $(window).innerWidth() > 1024 ) { 
            var decGrid = Math.round( $(this).find('.grid').offset().left ); 
            var decGauche = Math.round( $(this).find('.image-rep').offset().left ); 
            var larg = Math.round( $(this).find('.image-rep').innerWidth() ); 
            var newLarg = decGrid+larg+40;  
            $(this).find('.pre-bg').css("width", newLarg+25 + 'px');
            $(this).find('.pre-bg').css("left", decGauche + 'px');
        }
    });

    $('.management-services').each(function(){
        if ( $(window).innerWidth() > 1024 ) { 
            var decGrid = Math.round( $(this).find('.grid').offset().left ); 
            var decGauche = Math.round( $(this).find('.image-rep').offset().left ); 
            var larg = Math.round( $(this).find('.image-rep').innerWidth() ); 
            var newLarg = decGrid+larg+50;  
            $(this).find('.pre-bg').css("width", newLarg + 'px');
            $(this).find('.pre-bg').css("left", decGauche + 'px');
        }
    });


    $('.main-properties').each(function(){  
 

        if ( $(window).innerWidth() > 1024 ) {
            var decGrid = Math.round( $(this).find('.grid').offset().left );
            // var decGauche = Math.round( $(this).find('.image-rep').offset().left );
            // var larg = Math.round( $(this).find('.image-rep').innerWidth() );
            var decGaucheD = Math.round( $(this).find('.image-rep-d').offset().left );
            var largD = Math.round( $(this).find('.image-rep-d').innerWidth() );
            // var newLarg = decGrid+larg+50;  
            var newLargD = decGrid+largD+50;  
            // $(this).find('.pre-bg').css("width", newLarg + 'px');
            // $(this).find('.pre-bg').css("left", decGauche + 'px');


            $(this).find('.image-dec').css("width", newLargD + 'px');
            $(this).find('.image-dec').css("left", decGaucheD + 'px');

        }
    });



    $('.main-contact .second').each(function(){
        if ( $(window).innerWidth() > 1024 ) { 
            var decGrid = Math.round( $(this).find('.grid').offset().left ); 
            var decGauche = Math.round( $(this).find('.image-rep').offset().left ); 
            var larg = Math.round( $(this).find('.image-rep').innerWidth() ); 
            var newLarg = decGrid+larg;  
            $(this).find('.pre-bg').css("width", newLarg + 'px');
            // $(this).find('.pre-bg').css("left", decGauche + 'px');
        }
    });

	// $('.main-contact').each(function(){
	// 	if ( $(window).innerWidth() > 767 ) {

	// 		var hauteurTotale = $(this).innerHeight();

	// 		var decGauche = $(this).find('.image-rep').offset().left;
	// 		var larg = $(this).find('.image-rep').innerWidth();
	//  		var newLarg = decGauche+larg; 
	// 		$(this).find('.image-box').css("width", newLarg + 'px');
	// 		$(this).find('.image-box').css("height", hauteurTotale + 'px');
	// 		$(this).find('.map-box').css("left", newLarg + 'px');

	// 	}
	// });


} onResizeFunctions();



      function checkHeight() {

   

        oldHauteurRM = 0;
        $('.check-height-rm').each(function(){
          hauteurRM = $(this).innerHeight();
          if ( hauteurRM > oldHauteurRM) {
            oldHauteurRM = hauteurRM;
            console.log(oldHauteurRM)
          }
        });
        $('.check-height-rm').css('height',oldHauteurRM+'px');
   

        oldHauteur = 0;
        $('.check-height-1').each(function(){
          hauteur = $(this).innerHeight();
          if ( hauteur > oldHauteur) {
            oldHauteur = hauteur;
          }
        });
        $('.check-height-1').css('height',oldHauteur+'px');

      } checkHeight();




$(window).resize(function(){
    // console.log('resze')
    onResizeFunctions();
});





// $('#video .cover').click(function(e){
//     e.preventDefault();
//     $(this).fadeOut();

//     var videoURL = $(this).parent().children('iframe').prop('src');
//         videoURL += "&autoplay=1";
//         $(this).parent().children('iframe').prop('src',videoURL); 
//         return false;

        
// });





// ------------------------------

 

// --- DEBOUNCE FUNCTION

function debounce(a, b, c) {
    var d;
    return function() {
        var e = this,
            f = arguments;
        clearTimeout(d), d = setTimeout(function() { d = null, c || a.apply(e, f) }, b), c && !d && a.apply(e, f)
    }
}
 
// --- THROTTLE FUNCTION

function throttle(callback, delay) {
    var last;
    var timer;
    return function () {
        var context = this;
        var now = +new Date();
        var args = arguments;
        if (last && now < last + delay) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                last = now;
                callback.apply(context, args);
            }, delay);
        } else {
            last = now;
            callback.apply(context, args);
        }
    };
}


 




// const handleMousePos = (e) => {
//   const CURSOR = document.querySelector('#mouse-cursor');
//   const HOVER = document.querySelectorAll('a');
//   const { pageX: posX, pageY: posY } = e;

//   const runMouseOver = () => {
//     CURSOR.style.transform = 'scale(4)'; 
//   };
//   HOVER.forEach(hover => hover.addEventListener('mouseenter', runMouseOver));

//   const runMouseLeave = () => {
//     CURSOR.style.transform = ''; 
//   };
//   HOVER.forEach(hover => hover.addEventListener('mouseleave', runMouseLeave));
  
//   return (
//     CURSOR.style.left = `${posX - 10}px`,
//     CURSOR.style.top = `${posY - 10}px`  
//   );
// };
// document.addEventListener('mousemove', handleMousePos);

//  