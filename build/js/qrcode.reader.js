var gCtx = null;
var gCanvas = null;
var stype=0;
var gUM=false;
var webkit=false;
var moz=false;
var v=null;
var camStream=null;
var modal = $('#qr-code-reader-modal')
var result = null;
var vidhtml = '<video id="v" autoplay></video>';

function initCanvas(w,h)
{
    gCanvas = document.getElementById("qr-canvas");
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
}


function captureToCanvas() {
    if(stype!=1)
        return;
    if(gUM)
    {
        try{
            gCtx.drawImage(v,0,0);
            try{
                qrcode.decode();
            }
            catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
            };
        }
        catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
        };
    }
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function read(a)
{
    if (htmlEntities(a).split("sn=")[1]) {
        r = htmlEntities(a).split("sn=")[1]
    } else {
        r = htmlEntities(a).replace(/bitcoin:/, "").split("?")[0];
    }
    result.val(r);
    killQrCodeReaderMoadl();
}	

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}
function success(stream) {
    camStream = stream
    if(webkit)
        v.src = window.webkitURL.createObjectURL(stream);
    else
    if(moz)
    {
        v.mozSrcObject = stream;
        v.play();
    }
    else
        v.src = stream;
    gUM=true;
    setTimeout(captureToCanvas, 500);
}
		
function error(error) {
    gUM=false;
    return;
}

function loadQrCodeReader()
{
    modal.modal('show')
    console.log(modal)
	if(isCanvasSupported() && window.File && window.FileReader)
	{
		initCanvas(800, 600);
		qrcode.callback = read;
		document.getElementById("mainbody").style.display="inline";
        setwebcam();
	}
	else
	{
		document.getElementById("mainbody").style.display="inline";
		document.getElementById("mainbody").innerHTML='<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>'+
        '<br><p id="mp2">sorry your browser is not supported</p><br><br>'+
        '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="firefox.png"/></a> or <a href="http://chrome.google.com"><img src="chrome_logo.gif"/></a> or <a href="http://www.opera.com"><img src="Opera-logo.png"/></a></p>';
	}
}

function setwebcam()
{
    if(stype==1)
    {
        setTimeout(captureToCanvas, 500);    
        return;
    }

    var n=navigator;
    document.getElementById("outdiv").innerHTML = vidhtml;
    v=document.getElementById("v");

    if(n.getUserMedia)
        n.getUserMedia({video: true, audio: false}, success, error);
    else
    if(n.webkitGetUserMedia)
    {
        webkit=true;
        n.webkitGetUserMedia({video: true, audio: false}, success, error);
    }
    else
    if(n.mozGetUserMedia)
    {
        moz=true;
        n.mozGetUserMedia({video: true, audio: false}, success, error);
    }

    stype=1;
    setTimeout(captureToCanvas, 500);
}

function killQrCodeReaderMoadl () {
    modal.modal('hide');
    if (camStream) {
        camStream.stop();
    };
    stype = 0;
}

function killQrCodeReader () {
    if (camStream) {
        camStream.stop();
    };
    
    stype = 0;
}

var QRCodeReader = {

}

$('#qr-code-reader-modal').on('hide.bs.modal', function (e) {
    killQrCodeReader();
});

$(".qrcodeicon > span").click( function () {
    result = $(this).prev()
    loadQrCodeReader();
});