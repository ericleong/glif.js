/* global GifReader */
function start() {
	var canvases = document.getElementsByTagName('canvas'); 
	for (var i = 0; i < canvases.length; i++) { 
		var url = canvases[i].getAttribute('data-src'); 
		if (url) { 
			download(canvases[i], url);
		}
	}
}

function download(canvas, url) {
	var oReq = new XMLHttpRequest();

	oReq.onload = function(e) {
		var arrayBuffer = oReq.response; // not responseText

		if (arrayBuffer) {
			var byteArray = new Uint8Array(arrayBuffer);

			var gr = new GifReader(byteArray);

			var info = gr.frameInfo(0);
			canvas.width = info.width;
			canvas.height = info.height;

			if (!info.interlaced) { // gpu is not suited for interlaced gifs
				gliffer(canvas, gr, byteArray);
			} else {
				canvasser(canvas, gr);
			}
		}
	}

	oReq.open('GET', url, true);
	oReq.responseType = 'arraybuffer';
	oReq.send();
}

function gliffer(canvas, gr, byteArray) {
	
	var glif = new GLIF(canvas);
	
	var frame_num = 0;
	var frame_info;

	function draw() {

		frame_num = frame_num % gr.numFrames();
		frame_info = gr.frameInfo(frame_num);

		glif.updateTransparency(frame_info.transparent_index);
		glif.updatePalette(byteArray.subarray(frame_info.palette_offset, frame_info.palette_offset + 256 * 3), 256);

		if (frame_num == 0) {
			glif.clear();
		}

		gr.decodeAndGLIF(frame_num, glif);
		frame_num++;

		setTimeout(draw, frame_info.delay * 10);
	}

	if (glif.gl) {
		draw();
	}
}

function canvasser(canvas, gr) {
	var context = canvas.getContext('2d');

	var imagedata = context.createImageData(canvas.width, canvas.height);

	var frame_num = 0;
	var frame_info;

	function draw() {

		frame_num = frame_num % gr.numFrames();
		frame_info = gr.frameInfo(frame_num);

		gr.decodeAndBlitFrameRGBA(frame_num, imagedata.data);

		context.putImageData(imagedata, 0, 0);

		frame_num++;

		setTimeout(draw, frame_info.delay * 10);
	}

	draw();
}