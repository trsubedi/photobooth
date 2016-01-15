var originalCaman,
	filterContainer = $('#filterContainer');

$(document).ready(function() {
	// Dropzone.autoDiscover = false;

	// $('#fileUpload').dropzone({
	// 	url: '/not-real',
	// 	accept: function(file, done) {
	// 		var fileReader = new FileReader();

			// fileReader.onloadend = function() {
			// 	$('#edit-img').attr('src', fileReader.result);

			// 	// renders image as canvas
			// 	originalCaman = Caman('#edit-img', function () {
			// 		this.render();
			// 	});
			// }

	// 		fileReader.readAsDataURL(file);

	// 		// do not upload the file (yet)
	// 		return false;
	// 	}
	// });
	var MAX_HEIGHT = 500;
	var MAX_WIDTH  = 500;

	$('#fileUpload').fileReaderJS({
		readAsDefault: 'DataURL',
		on: {
			load: function(e, file) {
				var fileReader = new FileReader();
				
				fileReader.onloadend = function() {
					var image = new Image();

					image.onload = function() {
						$('#edit-canvas').remove();

						// var canvas = $('#edit-canvas')[0];
						var canvas = $('<canvas>')[0];
						$(canvas).attr('id', 'edit-canvas');
						$(canvas).addClass('img-responsive center-block');

						if(image.height > image.width) {
							if(image.height > MAX_HEIGHT) {
								image.width *= MAX_HEIGHT / image.height;
								image.height = MAX_HEIGHT;
							}
						} else if(image.width > image.height) {
							if(image.width > MAX_WIDTH) {
								image.height *= MAX_WIDTH / image.width;
								image.width = MAX_WIDTH;
							}
						}

						var ctx = canvas.getContext("2d");
						canvas.width = image.width;
						canvas.height = image.height;
						ctx.drawImage(image, 0, 0, image.width, image.height);

						// renders image as canvas
						originalCaman = Caman(canvas, function () {
							this.render();
						});

						$('#edit-img').addClass('hidden');
						$('#edit-view').append(canvas);
					};

					image.src = fileReader.result;
				}

				fileReader.readAsDataURL(file);
			}
		}
	});

	$('#filters a').on('click', function(event) {
		event.preventDefault();
		
		// Sets photo back to original
		originalCaman.revert();

		// revert sliders to 0
		$('.filterRange').val(0);

		// Storing id in variable
		var filterId = $(this).attr('id');

		// Based on what you clicked, run the filter if it exists
		if(typeof originalCaman[filterId] == 'function') {
			originalCaman[filterId]();
			originalCaman.render(function() {
				$('#download').attr('href', $('#edit-canvas')[0].toDataURL());
			});
		}
	});

	$('.filterRange').on('change', function(event) {
		var $input = $(this);
		var inputValue = $input.val();

		var filterId = $input.attr('data-filter');

		// Based on what you clicked, run the filter if it exists
		if(typeof originalCaman[filterId] == 'function') {
			originalCaman[filterId](inputValue);
			originalCaman.render(function() {
				$('#download').attr('href', $('#edit-canvas')[0].toDataURL());
			});

			$input.siblings('.filterValue').text(inputValue);
		}
	});

	// change values of slider
	var filterValue = $('#filterValue');

	$('.filterRange').slider({ 
		max: 100,
		min: -100,
		slide: function(event, ui) {
			filterValue.html(ui.value);
		}
	});

	$('#submit').on('submit', function (event) {
		event.preventDefault();
		
		// Send POST to server to create newly edited photo
		$.ajax({
			type: "POST",
			url: '/api/photos',
			data: {
				imageData: $('#edit-canvas')[0].toDataURL(),
				text: $('textarea[name=text]').val()
			},
			success: function(data) {
				alert('successfully created photo!');
				window.location = "/gallery";
				// window.location = "http://localhost:3000/gallery";
			}
		});
	});
	var $reset = $('#resetbtn');

	$reset.on('click', function(e) {
	    $('input[type=range]').val(0);
	    $('.filterValue').text(0);
	    Caman('#edit-canvas', function() {
	      this.revert();
	      this.render();
	    });
	  });

	// Use the mousewheel plugin to scroll
	// scroll the div more intuitively

	filterContainer.find('ul').on('mousewheel',function(e, delta){

		this.scrollLeft -= (delta * 50);
		e.preventDefault();

	});

	$('#signUpModal').on('shown.bs.modal', function(event) {
		$('#name').focus();
	});
});

