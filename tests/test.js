var request = require('request'),
    expect = require('chai').expect,
	serverjs = require("../server.js"),
	baseUrl = 'http://localhost:3000';

describe('Testing user API functionality', function() {

	describe('GET /', function() {
	  it('should return statusCode 200', function(done) {
	    request(baseUrl, function(error, response, body) {
	      expect(response.statusCode).to.equal(200);
	      done();
	    });
	  });
	});

	describe('GET /api/photos', function() {
  		it('should return statusCode 200', function(done) {
	    request(baseUrl + '/api/photos', function(error, response, body) {
	      expect(response.statusCode).to.equal(200);
	      done();
	    });
	  });
	});

	// describe('POST /api/photos', function() {
	//   it('should return statusCode 200', function(done) {
	//     request.post(
	//       {
	//         url: baseUrl + '/api/photos',
	//         img: {
	//         	data: Buffer,
	//         	contentType: 'Some photo'
	//         },
	//         text: 'Some comment',
	//         author: 'Some Author'
	//       },
	//       function(error, response, body) {
	//         expect(response.statusCode).to.equal(200);
	//         done();
	//       }
	//     );
	//   });
	// });

	describe('PUT /api/photos/1', function() {
	  it('should return statusCode 200', function(done) {
	    request.put(
	      {
	        url: baseUrl + '/api/photos/1',
	        text: 'Changed comment.'
	      },
	      function(error, response, body) {
	        expect(response.statusCode).to.equal(200);
	        done();
	      }
	    );
	  });
	});

	// describe('DELETE /api/photos/1', function() {
	//   it('should return statusCode 200', function(done) {
	//     request.del(baseUrl + '/api/photos/1', function(error, response, body) {
	//       expect(response.statusCode).to.equal(200);
	//       done();
	//     });
	//   });
	// }); 
});
