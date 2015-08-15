/* global GifReader */
var viewer = function(canvas, arrayBuffer, callback) {
	var byteArray = new Uint8Array(arrayBuffer);
	
	var gr = new GifReader(byteArray);
	
	var info = gr.frameInfo(0);
	canvas.width = info.width;
	canvas.height = info.height;

	// uses glif.js
	function gliffer(canvas, gr, byteArray, callback) {
	
		var glif = new GLIF(canvas);
		
		var frame_num = 0;
		var frame_info;
	
		return function draw() {
	
			frame_num = frame_num % gr.numFrames();
			frame_info = gr.frameInfo(frame_num);
	
			glif.updateTransparency(frame_info.transparent_index);
			glif.updatePalette(byteArray.subarray(frame_info.palette_offset, frame_info.palette_offset + 256 * 3), 256);
	
			if (frame_num == 0) {
				glif.clear();
			}
	
			gr.decodeAndGLIF(frame_num, glif);
			frame_num++;
			
			var timeout = setTimeout(draw, frame_info.delay * 10);
	
			if (typeof callback === 'function') {
				callback(timeout);
			}
			
			return timeout;
		}
	}
	
	// uses omggif.js
	function canvasser(canvas, gr, callback) {
		var context = canvas.getContext('2d');
	
		var imagedata = context.createImageData(canvas.width, canvas.height);
	
		var frame_num = 0;
		var frame_info;
	
		return function draw() {
	
			frame_num = frame_num % gr.numFrames();
			frame_info = gr.frameInfo(frame_num);
	
			gr.decodeAndBlitFrameRGBA(frame_num, imagedata.data);
	
			context.putImageData(imagedata, 0, 0);
	
			frame_num++;
	
			var timeout = setTimeout(draw, frame_info.delay * 10);
			
			if (typeof callback === 'function') {
				callback(timeout);
			}
			
			return timeout;
		}
	}
	
	if (!info.interlaced) { // gpu is not suited for interlaced gifs
		return gliffer(canvas, gr, byteArray, callback);
	} else {
		return canvasser(canvas, gr, callback);
	}
}