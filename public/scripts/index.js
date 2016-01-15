var originalCaman,
	filterContainer = $('#filterContainer');

$(document).ready(function() {
	$('#signUpModal').on('shown.bs.modal', function(event) {
		$('#name').focus();
	});

	// $('#sign-up').validate();

	$('#log-in').validate();

	$('#sign-up').on('submit', function(event) {
		event.preventDefault();

		$.ajax({
			type: 'POST',
			url: '/api/users',
			data: {
				user: {
					name: $('#signupName').val(),
					email: $('#signupEmail').val(),
					password: $('#signupPassword').val()
				}
			},
			success: function(data) {
				window.location = '/create';
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('Invalid input');
			}
		});
	});
});


