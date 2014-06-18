var jsonObjects = [],
	filteredObjects = [],
	sortParam, filterParam;

function getURLParameter(name) {
    return (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];
}

function removeHTMLChars(str) {
	return str.replace(/(<([^>]+)>)/ig,"");
}

function initDeafult() {
	// get sorting and filtering parameter from URI
	sortParam = getURLParameter('sort');
	filterParam = getURLParameter('filter');

	// if params not set, assign default values
	if(!sortParam) {
		// sorting is ascending by default
		sortParam = "asc";
	}

	if(!filterParam) {
		// filter for featured projects by default
		filterParam = "featured";
	}
}

function setURLParameter(){
	//set the URL accordingly
	if(getURLParameter('sort') != sortParam || getURLParameter('filter') != filterParam) {
		history.pushState(null, null, "index.html?sort="+sortParam+"&filter="+filterParam);
	}
}

initDeafult();

function setSwitchState() {
	// get URL parameters and set for display
	if(sortParam === 'asc') {
		$("#sortAsc").addClass("active");
		$("#sortNewest").removeClass("active");
	} else if(sortParam === 'newest') {
		$("#sortNewest").addClass("active");
		$("#sortAsc").removeClass("active");
	}
}

//set the URL accordingly
history.replaceState(null, null, "index.html?sort="+sortParam+"&filter="+filterParam);

window.addEventListener('popstate', function(event) {
	initDeafult();
	setSwitchState();
	filterJSON(filterParam);
	displayObjects();
});

// format updatedAt for outpuf in project card (using locale string)
function formatDate(date) {
	var formattedDate = new Date(date);
	return formattedDate.toLocaleDateString();
}

// set the active category in the navbar
function setCategoryActive(cat) {
	$(".nav-category").each(function(i, obj) {
		if(cat.toLowerCase() === $(obj).text().toLowerCase()) {
			$(obj).parent().addClass('active');
		} else {
			$(obj).parent().removeClass('active');
		}
	});
}

// filter JSON by category
function filterJSON(cat) {
	filterParam = cat.toLowerCase();
	// reset search input field
	$('#searchTxt').val('');

	if(cat.toLowerCase() === "all") {
		filteredObjects = jsonObjects;
	} else {
		filteredObjects = [];

		$.each(jsonObjects, function(i, item) { 
			// for each category
			var isPartOfCategory = false;

			$.each(item.categories, function(c, category) { 
				if(category.name.toLowerCase() === cat.toLowerCase()) {
					isPartOfCategory = true;
				}
			});

			if(isPartOfCategory) {
				filteredObjects.push(item);
			}
		});
	}

	//set the URL accordingly
	setURLParameter();
	setCategoryActive(filterParam);
}

// search JSON for specific input
function searchJSON(input) {
	var searchStr = input.toLowerCase();
	
	filteredObjects = [];

	$.each(jsonObjects, function(i, item) { 
		var project = item.projectTitle.toLowerCase(),
			description = item.projectDescription.toLowerCase();

		if((project.indexOf(searchStr) >= 0) || (description.indexOf(searchStr) >= 0)) {
			filteredObjects.push(item);
		}
	});
}

// sort filtered projects by param
function sortJSON() {
	filteredObjects.sort( function(a,b) { 
		var valueA,valueB;

		switch(sortParam) {
			// ascending by project name
			case 'asc':
				valueA=a.projectTitle.toLowerCase();
				valueB=b.projectTitle.toLowerCase();
				break;
			// newest by creation date (b and a is changed on purpose)
			case 'newest':
				valueA= new Date(b.updatedAt);
				valueB= new Date(a.updatedAt);
				break;
		}

		  if (valueA < valueB){ 
		    return -1; 
		  } else if (valueA > valueB){ 
		    return 1;
		  } else { 
		    return 0;
		  }
	});

	//set the URL accordingly
	setURLParameter();
}

function displayObjects() {
	// TODO: search & onLoad & URL
	if(filteredObjects.length > 0) {
		sortJSON();
		$( ".Container" ).empty();
		$.each(filteredObjects, function(i, item) { 
			var str = '<div class="col-md-6 mix"><p class="header"><span class="updatedAt"><i class="fa fa-clock-o"></i> Updated on '+formatDate(removeHTMLChars(item.updatedAt))+'</span><span class="categories">';
			// add all categories as labels
			$.each(item.categories, function(c, category) {
				if(category.name.toLowerCase() === "featured") {
					str += '<a class="filter"><span class="label label-default label-featured">'+removeHTMLChars(category.name.toUpperCase())+'</span></a>';
				} else {
					str += '<a class="filter"><span class="label label-default">'+removeHTMLChars(category.name.toUpperCase())+'</span></a>';
				}
			});
			if(item.projectTitle.length > 31) {
				str += '</span></p><div class="card-desc"><h2><a target="_blank" href="'+removeHTMLChars(item.linkToGithub)+'">'+removeHTMLChars(item.projectTitle.substring(0,30))+'...<a/></h2>';
			} else {
				str += '</span></p><div class="card-desc"><h2><a target="_blank" href="'+removeHTMLChars(item.linkToGithub)+'">'+removeHTMLChars(item.projectTitle)+'<a/></h2>';
			}

			// if project description too long, add "..."
			if(item.projectDescription.length > 285) {
				str += '<p class="description">'+removeHTMLChars(item.projectDescription.substring(0, 284))+'...</p></div><p class="actions">';
			} else {
				str += '<p class="description">'+removeHTMLChars(item.projectDescription) +'</p></div><p class="actions">';
			}

			// project url not required, so just add if available
			if(item.linkToProject) {
				str += '<a target="_blank" class="btn btn-info btn-bottom-left" href="'+removeHTMLChars(item.linkToGithub)+'" role="button"><i class="fa fa-code-fork"></i> Repository</a>';
				str += '<a target="_blank" class="btn btn-success btn-bottom-right" href="'+removeHTMLChars(item.linkToProject)+'" role="button"><i class="fa fa-cogs"></i> Get started</a></p></div>';
			} else {
				str += '<a target="_blank" class="btn btn-info btn-bottom-full" href="'+removeHTMLChars(item.linkToGithub)+'" role="button"><i class="fa fa-code-fork"></i> Repository</a>';
			}
			$( ".Container" ).append( str );
		});

		$(".filter").on( "click", function(event) {
			$(".nav-category").parent().removeClass('active');
			
			filterJSON($(event.target).text());
			setCategoryActive($(event.target).text());
			displayObjects();
		});
	} else {
		// filtered objects is empty - show info
		$( ".Container" ).empty().append('<div class="col-md-12" id="noResults">No results to display</div');
	}
}

$( document ).ready(function() {
	// word rotation in header
	$(function() {
	    var words = ['Give', 'Take', 'Solve'],
	        index = 0,
	        $el = $('#rotate-word')
	    setInterval(function() {
	        index++ < words.length - 1 || (index = 0);
	        $el.fadeOut(function() {
	            $el.text(words[index]).fadeIn();
	        });
	    }, 3000);
	});


	// sticky navbar on top
	$(window).scroll(function(e){
	    // let logo scroll with content
	    var top = $(window).scrollTop();
	    if(top >= 250) {
	      $(".navbar").css('transform', 'translateY('+(top-250)+'px)');
	    } else {
	      $(".navbar").css('transform', 'translateY(0px)');
	    }

	    if($("#nav").position().top - top < 453) {
	      $(".stack-bottomright").css('bottom',453+'px');
	    }

	    // back to top button
	    if ($(this).scrollTop() > 250) {
        	$('#back-to-top').fadeIn();
        } else {
        	$('#back-to-top').fadeOut();
        }
    });

    // scroll body to 0px on click
    $('#back-to-top').click(function () {
		$('#back-to-top').tooltip('hide');
		$('body,html').animate({
			scrollTop: 0
		}, 800);
		return false;
    });
        
    $('#back-to-top').tooltip('show');

    $('#sortAsc').click(function () {
    	sortParam = 'asc';
    	setSwitchState();
    	sortJSON();
	  	displayObjects();
    });

    $('#sortNewest').click(function () {
    	sortParam = 'newest';
    	setSwitchState();
    	sortJSON();
	  	displayObjects();
    });

	// load project details via ajax
	$.getJSON( "projects/projects.json", function( data ) {
		jsonObjects = data;

		setSwitchState();

		filterJSON(filterParam);
		displayObjects();
	});

	$('#searchTxt').on( "keyup", function(event) {
		// if search is empty, reset to show all objects
		if(!$('#searchTxt').val()) {
			filteredObjects = jsonObjects;
			filterParam = 'all';
			setCategoryActive("all");
			//set the URL accordingly
			setURLParameter();
		} else {
			$(".nav-category").parent().removeClass('active');
			var search = $('#searchTxt').val();
			searchJSON(search);
		}
		displayObjects();
	});
});


