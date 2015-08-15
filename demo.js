var download = function(canvas, url) {
	var oReq = new XMLHttpRequest();

	oReq.onload = function(e) {
		var arrayBuffer = oReq.response; // not responseText
		
		if (arrayBuffer) {
			viewer(canvas, arrayBuffer)();
		}
	}

	oReq.open('GET', url, true);
	oReq.responseType = 'arraybuffer';
	oReq.send();
}

var canvases = document.getElementsByTagName('canvas');

for (var i = 0; i < canvases.length; i++) {
	var url = canvases[i].getAttribute('data-src'); 

	if (url) {				
		download(canvases[i], url);
	}
}