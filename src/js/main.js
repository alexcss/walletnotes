var doc
var doc_name
var $_GET = {};

$(document).ready(function(data) {

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

        if(document.location.toString().indexOf('?') !== -1) {
            var query = document.location
                .toString()
                // get the query string
                .replace(/^.*?\?/, '')
                // and remove any existing hash string (thanks, @vrijdenker)
                .replace(/#.*$/, '')
                .split('&');

            for(var i=0, l=query.length; i<l; i++) {
                var aux = decodeURIComponent(query[i]).split('=');
                $_GET[aux[0]] = aux[1];
            }
        }
        if ($_GET['sn']) {
            $('#id_number').val($_GET['sn']);
            console.log($_GET['sn']);
            $('.enter').click();
        };

        $("#walletnote-download").click(function () {
            doc.save(doc_name);
        });
        $('body').fadeIn(500);

        $("#conditions" ).click(function() {
            $('.panels').fadeOut(500,
                function(){
                    $("#step1").fadeIn(500)
                });
        });

        $("#submit" ).click(function() {
            //qr
            $("#qr_code").qrcode({
                render: 'canvas',
                size: 180,
                text: 'bitcoin:' + data.address + '?amount=' + data.amount
            });
        });

        $("#submit" ).click(function() {
            $('#step1').fadeOut(500,
                function(){
                    $("#step2").fadeIn(500)
                });
        });



        $("#id_amount").change(function () {
            $.get('http://walletnotes.org/calc-donate/?amount=' + $(this).val(), function (data) {
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
                    $("#number-view").html("Walletnote: " + data.number)
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
                    $("#pin").html("PIN: " + $('#id_pincode').val())
                    generateWalletnote(amount.toString(), data.number, $('#id_pincode').val());
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
                    $('#print-walletnote').modal();
                } else {
                    $("#payment-status").html('<div class="alert alert-danger" role="alert"><strong>Shit!</strong> Payment wrong!</div>')
                    $("#CountDownTimer").TimeCircles().destroy();
                }
            };
        }, 'json')
    }

    function generateWalletnote (amount, serial, pass) {

        doc = new jsPDF("l", "mm", "a4");
        var imgData = new Image();
        var qr_fill = '#3a3';
        var walletnote_base
        if (amount == 1) {
            walletnote_base = "img/walletnotes/1mB.jpg";
            qr_fill = '#008aab'
        };
        if (amount == 2) {
            walletnote_base = "img/walletnotes/2mB.jpg";
            qr_fill = '#fa8e3d'
        };
        if (amount == 5) {
            walletnote_base = "img/walletnotes/5mB.jpg";
            qr_fill = '#434172'
        };
        if (amount == 10) {
            walletnote_base = "img/walletnotes/10mB.jpg";
            qr_fill = '#e4ce3a'
        };
        if (amount == 20) {
            walletnote_base = "img/walletnotes/20mB.jpg";
            qr_fill = '#b95794'
        };
        if (amount == 50) {
            walletnote_base = "img/walletnotes/50mB.jpg";
            qr_fill = '#e44c42'
        };
        if (amount == 100) {
            walletnote_base = "img/walletnotes/100mB.jpg";
            qr_fill = '#5cbc46'
        };
        if (amount == 200) {
            walletnote_base = "img/walletnotes/200mB.jpg";
            qr_fill = '#009f99'
        };
        if (amount == 500) {
            walletnote_base = "img/walletnotes/500mB.jpg";
            qr_fill = '#f34f6f'
        };

        $('#walletnote-img').attr('src', walletnote_base)
        imgData.src = walletnote_base
        imgData.onload = function () {
            doc.addImage(imgData, 'JPEG', 0, 0, 145.5, 70);
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255)
            serial_f = serial[0] + serial[1] + serial[2] + ' '+ serial[3] + serial[4] + serial[5] + serial[6] + ' '+ serial[7] + serial[8] + serial[9] + serial[10] + ' '+ serial[11] + serial[12] + serial[13] + serial[14] + ' '+ serial[15] + serial[16] + serial[17] + serial[18]
            $('#serial-number').html(serial_f);
            doc.text(42, 10, serial_f);
            $("#serial-number-qr").html('');
            $("#serial-number-qr").qrcode({
                render: 'image',
                size: 150,
                fill: qr_fill,
                text: "http://walletnotes.org/redeem.html?sn=" + serial
            });
            var qr = $("#serial-number-qr").children("img").attr("src");
            doc.addImage(qr, 'JPEG', 112, 37.1, 30, 30);
            if (pass) {
                doc.setFontSize(15);
                doc.setTextColor(0,0,0)
                doc.text(0, 80, "PIN: " + pass);
                $('#pin-print').html("PIN: " + pass)
            };
            var string = doc.output('datauristring');
            // $('#walletnote').attr('src', string);
            doc_name = 'walletnote_' + amount + '_mBTC.pdf'
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

    $("#qr-addres-donate").qrcode({
        render: 'image',
        size: 150,
        fill: '#444',
        text: "bitcoin:1McfTNwrSJkXAxxfWvEtxWkMwGt3rJDsvr"
    });

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
    });

    // tolltip + pin
    $("#id_pincode").val(str_rand(8));
    $.get('http://walletnotes.org/calc-donate/?amount=' + $("#id_amount").val(), function (data) {
        console.log(data.donate)
        donate = data.donate * 1000
        $("#id_donate").next("label").html("Support the project (add " + donate.toString() + " m฿ donation to funds.)")
    });

    $("[rel='tooltip']").tooltip();

    // email hover with inpur show/hide
    var mailBl = $('.inputEmail');
    var emailBtn= $('.inputEmail .btn');
    var emailInput = $('.inputEmail > input');
    var emailInputInFocus = false;

    $(mailBl).hover(
        function () {
            if (!emailInputInFocus) {
                emailInputInFocus = true;
                //console.log(emailInputInFocus);
                $(emailBtn).fadeTo("slow", 0, function () {
                    $(this).css('top', '-60px');
                })
            }
        },
        function () {
            ($(emailInput).focus());
        }
    );

    $(emailInput).on('focusout', function () {
        emailInputInFocus = false;
        $(emailBtn).css('top', '0px');
        $(emailBtn).fadeTo("slow" , 1);
        //console.log(emailInputInFocus);
    });


});