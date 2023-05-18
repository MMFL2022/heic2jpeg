import { Component } from '@angular/core';
import libheif from 'libheif-js';
import { stopwatch } from './stopwatch';
// declare var libheif;
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'heic2jpg';
  
  stopwatcher = stopwatch();

  file: any;
  filename;
  image_data;
  decoder;
  drawer;
  canvas;
  container;
  showImage(image) {
    this.canvas.width = this.canvas.height = 0;
    console.log('drawing image ' + this.stopwatcher.ms);
    this.drawer.draw(image);
    console.log('done ' + this.stopwatcher.ms);
  }
  saveImage(format?) {
    if (!format) {
      format = 'image/jpeg';
    }

    var FILE_EXTENSIONS = {
      'image/jpeg': '.jpeg',
      'image/png': '.png'
    };
    this.canvas.toBlob(
      function(blob) {
        var extension = FILE_EXTENSIONS[blob.type] || '.bin';
        var basename = this.filename.replace(/\.[^/.]+$/, '');
        if (navigator.msSaveOrOpenBlob) {
          navigator.msSaveOrOpenBlob(blob, basename + extension);
          return;
        }

        var url = URL.createObjectURL(blob);
        var dlink = document.createElement('a');
        dlink.download = basename + extension;
        dlink.href = url;
        dlink.click();
        URL.revokeObjectURL(url);
      }.bind(this),
      format
    );
  }

  loadBuffer(buffer, filename) {
    var CanvasDrawer = function(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.image_data = null;
      this.container = document.getElementById('container');
      this.draw = image => {
        var w = image.get_width();
        var h = image.get_height();
        if (
          w != this.canvas.width ||
          h != this.canvas.height ||
          !this.image_data
        ) {
          this.canvas.width = w;
          this.canvas.height = h;
          if (w > document.body.clientWidth) {
            this.container.style['padding-bottom'] =
              String(100 * (h / w)) + '%';
          } else {
            this.container.style['padding-bottom'] = '';
          }
          this.image_data = this.ctx.createImageData(w, h);
          var image_data = this.image_data.data;

          for (var i = 0; i < w * h; i++) {
            this.image_data.data[i * 4 + 3] = 255;
          }
        }

        image.display(
          this.image_data,
          function(display_image_data) {
            if (window.requestAnimationFrame) {
              this.pending_image_data = display_image_data;
              window.requestAnimationFrame(
                function() {
                  if (this.pending_image_data) {
                    this.ctx.putImageData(this.pending_image_data, 0, 0);
                    this.pending_image_data = null;
                  }
                }.bind(this)
              );
            } else {
              this.ctx.putImageData(display_image_data, 0, 0);
            }
          }.bind(this)
        );
      };
    };
    this.filename = filename;

    // for (var i = 0; i < this.image_data.length; i++) {
    //     this.image_data[i].free();
    // }
    this.canvas = document.getElementById('canvas');
    this.drawer = new CanvasDrawer(this.canvas);
    this.decoder = new libheif.HeifDecoder();
    console.log('decoding image ' + this.stopwatcher.ms);
    this.image_data = this.decoder.decode(buffer);
    console.log('decoded image ' + this.stopwatcher.ms, this.image_data);

    if (!this.image_data || !this.image_data.length) {
      this.showImage(this.image_data[0]);
    }
    this.showImage(this.image_data[0]);
    // this.saveImage();
    if (this.image_data.length > 1) {
      // show("images");
      // while (this.images_select.firstChild) {
      //     this.images_select.removeChild(this.images_select.firstChild);
      // }
      // for (var i = 0; i < this.image_data.length; i++) {
      //     var option = document.createElement("option");
      //     option.setAttribute("value", i);
      //     var label = document.createTextNode("Image " + (i+1));
      //     option.appendChild(label);
      //     // this.images_select.appendChild(option);
      // }
    } else {
      // hide("images");
    }
    return true;
  }
  
  readerOnLoad(file) {
    return e => {
      setTimeout(() => {
        var buffer = e.target.result;
        console.log('readerOnLoad ' + this.stopwatcher.ms);
        if (!this.loadBuffer(buffer, file.name)) {
          console.log('buffer loaded' + this.stopwatcher.ms);
        }
      }, 1);
    };
  }
  
  selectFile(event) {
    this.stopwatcher.reset();

    this.file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = this.readerOnLoad.call(this, this.file);
    reader.readAsArrayBuffer(this.file);

    console.log('file selected ' + this.stopwatcher.ms);
  }

}
