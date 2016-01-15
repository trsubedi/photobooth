$(document).ready(function() {

	// Photo Template
	var photoTemplate = _.template($('#photo-template').html());
	// Photo gallery list
	var $photoList = $('#photo-gallery');

	var photoController = {

		allPhotos: [],

		// gets all images to gallery
		all: function() {
			$.get('/api/photos', function(data) {
				allPhotos = data;
				// Append existing post (from photos) to view
				_.each(allPhotos, function(photo, index) {
					var $photo = $(photoTemplate(photo));
					$photo.attr('data-index', index);
					$photoList.prepend($photo);
				});
			});
		},

		getPhoto: function(id) {
			return _.findWhere(allPhotos, {_id: id});
		},

		resetModal: function() {
			$('.text').removeClass('text-edit');
			$('.modal-footer').addClass('hidden');
		},

		delete: function(id) {
			$.ajax({
				type: 'DELETE',
				url: '/api/photos/' + id,
				success: function(data) {
					// delete photo from gallery
					$('.photo[data-id=' + id + ']').remove();
					// hide modal
					$('#photo-modal').modal('hide');
				}
			});
		}
	};

	photoController.all();

	$('#photo-modal').on('show.bs.modal', function(event) {
		var anchor = $(event.relatedTarget);
		var id = anchor.closest('.photo').attr('data-id');
		var photo = photoController.getPhoto(id);
		var modal = $(this);

		$(modal).attr('data-photo-id', id);
		modal.find('.image img').attr('src', '/photos/' + photo._id);
		modal.find('.author').val(photo.author.name);
		modal.find('.text').val(photo.text);
	});

	$('#photo-modal').on('hidden.bs.modal', function(event) {
		photoController.resetModal();
	});

	$('.edit-pencil').on('click', function(event) {
		$('.text').addClass('text-edit');
		$('.modal-footer').removeClass('hidden');
	});

	$('.delete-photo').on('click', function(event) {
		var modal = $('#photo-modal');
		var id = $(modal).attr('data-photo-id');
		
		photoController.delete(id);

	});

	$('#update-photo').on('submit', function(event) {
		event.preventDefault();

		var modal = $('#photo-modal');
		var id = $(modal).attr('data-photo-id');
		var photo = photoController.getPhoto(id);
		var updateText = modal.find('.text').val();

		photo.text = updateText;

		$.ajax({
			type: 'PUT',
			url: '/api/photos/' + id,
			data: photo,
			success: function(data) {
				photoController.resetModal();
			},
			error: function(jqXHR, textStatus, errorThrow) {
				console.log(textStatus);
			}
		});
	});
	$('#signUpModal').on('shown.bs.modal', function(event) {
		$('#name').focus();
	});
});
