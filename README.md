# glif.js

glif.js is a fork of [omggif](https://github.com/deanm/omggif) that speeds up gif decoding using WebGL.

# usage

## raw decoding

```javascript
var gr = new GifReader(byteArray);
var glif = new GLIF(canvas);

var info = gr.frameInfo(frame_num);
	
glif.updateTransparency(info.transparent_index);
glif.updatePalette(byteArray.subarray(info.palette_offset, info.palette_offset + 256 * 3), 256);

if (frame_num == 0) {
	glif.clear();
}

gr.decodeAndGLIF(frame_num, glif);
```

## animating

Use `viewer.js` to help animate the gif.

```javascript
var animate = viewer(canvas, arrayBuffer);
animate();
```

# how

GIF decoding is slow because LZW decompression must be performed serially. But the next step, mapping palette indices to RGB colors, is easily parallelizable by the GPU.

More specifically, it turns this slow `for` loop:

```JavaScript
for (var i = 0, il = index_stream.length; i < il; ++i) {
	var index = index_stream[i];

	if (xleft === 0) {  // Beginning of new scan line
		op += scanstride;
		xleft = framewidth;
	}

	if (index === trans) {
		op += 4;
	} else {
		var r = buf[palette_offset + index * 3];
		var g = buf[palette_offset + index * 3 + 1];
		var b = buf[palette_offset + index * 3 + 2];
		pixels[op++] = r;
		pixels[op++] = g;
		pixels[op++] = b;
		pixels[op++] = 255;
	}
	--xleft;
}
```

into this fragment shader:

```GLSL
varying highp vec2 vTextureCoord;

uniform sampler2D uIndexStream;
uniform sampler2D uPalette;

uniform bool uTransparency;
uniform mediump float uTransparent;

void main(void) {
	mediump float uIndex = texture2D(uIndexStream, vTextureCoord).r;

	if (uTransparency && uIndex == uTransparent) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	} else {
		gl_FragColor = texture2D(uPalette, vec2(uIndex, 0.5));
	}
}
```

# License

```
(c) Dean McNamee <dean@gmail.com>, 2013.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
```