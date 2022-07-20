(function(){
	var video = document.getElementById('video'),
		canvas = document.getElementById('canvas'),
		vendorUrl = window.URL || window.webkitURL;

	navigator.getMedia = 	navigator.getUserMedia ||
							navigator.webkitGetUserMedia ||
							navigator.mozGetUserMedia ||
							navigator.msGetUserMedia;

	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
	let ctx = canvas.getContext('2d');
	let track;
	let imageCapture;

	function blobToDataURL(blob, callback) {
		var a = new FileReader();
		a.onload = function(e) {callback(e.target.result);}
		a.readAsDataURL(blob);
	}

    
	function addRec(rec)
	{
        var len = rec.length; 
        var parent = document.getElementById("overlay");
        parent.innerHTML = "";
        parent.style += "width:640px; height:480px; border: 2px solid #FF0000; position:relative;"
        for (var i = 0; i < len; i++)
        {
            var atr = rec[i]
            var ele = document.createElement("div");
            ele.className += " box"
            ele.style.top = ""+atr[1]+"px"; 
            ele.style.left = ""+atr[2]+"px";
            ele.style.width = ""+atr[3]+"px";
            ele.style.height = ""+atr[4]+"px";
            ele.style.border = "2px solid blue";
            ele.style.color = '#00FFFF';
            ele.style.position = 'absolute'; 
            ele.style.border = '2px solid';
            var div = document.createElement("div");
            div.innerHTML = atr[0];
            div.className += " div";
            div.style.top = ""+atr[1]+"px";
            div.style.left = ""+(atr[2]) +"px";
            div.style.color = '#00FFFF';
            div.style.position = 'absolute';
            parent.appendChild(ele);
            parent.appendChild(div);
        }
	}


	function sendSnapshot() {
		// imageCapture.grabFrame()
		// .then(imageBitmap => {
		// 	drawCanvas(canvas, imageBitmap);
		// })

		ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
		// console.log(video.videoHeight, video.videoWidth)

		let dataURL = canvas.toDataURL('image/jpeg');
		socket.emit('input', dataURL);
		socket.on('rec', data => {
			console.log(data);
			addRec(data);
		});
	}

	navigator.getMedia({
		video: true,
		audio: false
	}, function(stream){
		video.srcObject = stream;
		track = stream.getVideoTracks()[0]
		imageCapture = new ImageCapture(track);

		setInterval(() => {
			if (stream)
				sendSnapshot();
		}, 200);

		// video.play();
	}, function(error){
		console.log(error);
	})

	socket.on('rec', data => {
		console.log(data);
	});
})();

(function($) {

	// Breakpoints.
		skel.breakpoints({
			xlarge:	'(max-width: 1680px)',
			large:	'(max-width: 1280px)',
			medium:	'(max-width: 980px)',
			small:	'(max-width: 736px)',
			xsmall:	'(max-width: 480px)'
		});

	$(function() {

		var	$window = $(window),
			$body = $('body');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 100);
			});

		// Prioritize "important" elements on medium.
			skel.on('+medium -medium', function() {
				$.prioritize(
					'.important\\28 medium\\29',
					skel.breakpoint('medium').active
				);
			});

	// Off-Canvas Navigation.

		// Navigation Panel.
			$(
				'<div id="navPanel">' +
					$('#nav').html() +
					'<a href="#navPanel" class="close"></a>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'left'
				});

		// Fix: Remove transitions on WP<10 (poor/buggy performance).
			if (skel.vars.os == 'wp' && skel.vars.osVersion < 10)
				$('#navPanel')
					.css('transition', 'none');

	});
})(jQuery);
