// var sayHello = require('./say-hello');// example of Browserify require

$(document).ready(function(data) {

    // sayHello();// example of Browserify require

        var controller = $.superscrollorama();
        controller.addTween('#just', TweenMax.from( $('.hand-wrapper.right'), .5, {css:{left: 1500}}));
        controller.addTween('#soulful', TweenMax.from( $('.hand-wrapper.left'), .5, {css:{left: -1000}}));
        controller.addTween('#contribute', TweenMax.from( $('#m1_b'), 1.5, {css:{opacity: 0}}));
        controller.addTween('#contribute', TweenMax.from( $('#m1_m'), 3, {css:{opacity: 0}}));
        controller.addTween('#contribute', TweenMax.from( $('#m1_s'), .5, {css:{opacity: 0}}));
        controller.addTween('#contribute', TweenMax.from( $('#m2_b'), 1, {css:{opacity: 0}}));
        controller.addTween('#contribute', TweenMax.from( $('#m2_m'), 2, {css:{opacity: 0}}));
        controller.addTween('#contribute', TweenMax.from( $('#m2_s'),.1, {css:{opacity: 0}}));
        controller.addTween('#even', TweenMax.from( $('.lock'), .5, {css:{top: 300}}));

        $('body').fadeIn(500);

        $("#conditions" ).click(function() {
            $('.panels').remove();
            $("#step1").show();
        });
        $("#id_amount").change(function () {
            $.get('http://' + location.host + '/calc-donate/?amount=' + $(this).val(), function (data) {
                console.log(data.donate)
                donate = data.donate * 1000
                $("#id_donate").next("label").html("Support the project (add " + donate.toString() + " m฿ donation.)")
            });
        });
        $('#submit').click(function () {
            var pincode
            if ($('#id_pincode').val() != "") {
                pincode = hex_md5($('#id_pincode').val())
            };
            var amount = $('#id_amount').val() * 1000
            $.post('http://' + location.host + '/payment/', {pincode: pincode, amount: $('#id_amount').val(), donate: $('#id_donate').prop('checked')}, function (data) {
                $("#payment-status").html('')
                $('#payment_address').html('')
                $('#qr_code').html('')
                if ($("#CountDownTimer").html() != '') {
                    $("#CountDownTimer").TimeCircles().destroy();
                }
                $('#id_amount').parent().removeClass('has-error');
                $('#id_pincode').parent().removeClass('has-error');
                $('#id_amount').parent().removeClass('has-success');
                $('#id_pincode').parent().removeClass('has-success');
                if( data.pincode_error == true && data.amount_error == true) {
                    $('#id_pincode').parent().addClass('has-error');
                    $('#id_amount').parent().addClass('has-error');
                } else if(data.pincode_error == true){
                    $('#id_pincode').parent().addClass('has-error');
                    $('#id_amount').parent().addClass('has-success');
                } else if( data.amount_error == true ){
                    $('#id_amount').parent().addClass('has-error');
                    $('#id_pincode').parent().addClass('has-success');
                } else {
                    $('#id_amount').parent().addClass('has-success');
                    $('#id_pincode').parent().addClass('has-success');
                }
                $("#CountDownTimer").attr("data-timer", 60 * data.time);
                if (data.address){
                    $('#payment_address').attr('href', 'bitcoin:' + data.address + '?amount=' + data.amount)
                    $('#amount-view').html(data.amount + " BTC (miner's fee included)")
                    $("#number-view").html("Bitknote: " + data.number)
                    $("#payment-address").html('<p>Scan this QR-code with your mobile wallet or <a  href="' + 'bitcoin:' + data.address + '?amount=' + data.amount + '">click here</a> to use your desctop wallet</p>')
                    $("#CountDownTimer").TimeCircles({ time: { Days: { show: false },
                        Hours: { show: false }, Minutes: { show: true },
                        Seconds: {color: "#3a87ad"} },
                        bg_width: 0.3, fg_width: 0.03,
                        count_past_zero: false});
                    $("#qr_code").qrcode({
                        render: 'canvas',
                        size: 150,
                        text: 'bitcoin:' + data.address + '?amount=' + data.amount
                    });
                    $("#pin").html("PIN:" + $('#id_pincode').val())
                    generateBitknote(amount.toString(), data.number, $('#id_pincode').val());
                    $('#step1').remove();
                    $("#step2").show();
                    recive();
                }
            }, 'json');
        })


    function recive () {
        $.get('http://' + location.host + '/recive/', function (data) {
            if (data) {
                if (data.payment_status == 1) {
                    $("#payment-status").html('<div class="alert alert-success" role="alert"><strong>Well done!</strong> Payment success!</div>')
                    $("#CountDownTimer").TimeCircles().destroy();
                    $('#print-bitknote').modal();
                } else {
                    $("#payment-status").html('<div class="alert alert-danger" role="alert"><strong>Shit!</strong> Payment wrong!</div>')
                    $("#CountDownTimer").TimeCircles().destroy();
                }
            };
        }, 'json')
    }

    function generateBitknote (amount, serial, pass) {
        var doc = new jsPDF("l", "mm", "a4");
        var imgData = new Image();
        imgData.src = "images/bitknote.jpg";
        imgData.onload = function () {
            doc.addImage(imgData, 'JPEG', 0, 0, 145.5, 70);
            doc.setFontSize(105);
            doc.setTextColor(255, 255, 255)
            doc.text(5, 65, amount);

            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255)
            serial_f = serial[0] + serial[1] + serial[2] + ' '+ serial[3] + serial[4] + serial[5] + serial[6] + ' '+ serial[7] + serial[8] + serial[9] + serial[10] + ' '+ serial[11] + serial[12] + serial[13] + serial[14] + ' '+ serial[15] + serial[16] + serial[17] + serial[18]
            doc.text(42, 10, serial_f);

            doc.setFontSize(15);
            doc.setTextColor(92, 188, 86)
            doc.text(115, 10, amount + " mB");

            $("#serial-code").qrcode({
                render: 'image',
                size: 150,
                fill: '#3a3',
                text: "http://bitknotes.org/man?sn=" + serial
            });
            var qr = $("#serial-code").children("img").attr("src");
            doc.addImage(qr, 'JPEG', 115, 37.1, 30, 30);
            if (pass) {
                doc.setFontSize(15);
                doc.setTextColor(0,0,0)
                doc.text(0, 80, "PIN:" + pass);
            };
            var string = doc.output('datauristring');
            $('#bitknote').attr('src', string);
        }
    }
    function str_rand(count) {
        var result       = '';
        var words        = '0123456789';
        var max_position = words.length - 1;
        for( i = 0; i < count; ++i ) {
            position = Math.floor ( Math.random() * max_position );
            result = result + words.substring(position, position + 1);
        }
        return result;
    }

    $(".navbar-nav a").click(function () {
        event.preventDefault();
        newLocation = this.href;
        $('body').fadeOut(500, newpage);
    })

    function newpage() {
        window.location = newLocation;
    }

    $('[rel=popover]').popover({
        html:true,
        placement:'top',
        trigger: 'hover focus',
        content:function(){
            return $($(this).data('contentwrapper')).html();
        }
    });

    //$("#qr-addres-donate").qrcode({
    //    render: 'image',
    //    size: 150,
    //    fill: '#1c1c1c',
    //    text: "bitcoin:1McfTNwrSJkXAxxfWvEtxWkMwGt3rJDsvr"
    //});

    //// fadein qr on index page
    //$('.support').hover(function(){
    //        $('.qrSupport').fadeIn()
    //    }, function(){
    //        $('.qrSupport').fadeOut()
    //    }
    //);

    $('#form-contact').submit(function (e) {
        e.preventDefault();
        $.post("/send-message/",
        $(this).serialize(),
        function (data) {
            console.log(data);
            $("#message-text").parent().removeClass('has-error');
            $("#contactModal").modal("hide");
        })
        .fail(function (err) {
            err = err.responseJSON;
            console.log(err);
            if (err.err_text) {
                $("#message-text").parent().addClass('has-error');
            };
        });
    })

});