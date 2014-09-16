var SN;   
var amount;
var real_amount;
var pin
    function changePincode () {
        var pincode_hash
        
        if ($('#id_newpincode').val() != "") {
            pin = $('#id_newpincode').val();
            pincode_hash = hex_md5(pin)
        };
        $.post('http://' + location.host + '/change-pincode/', {id: SN, new_pin: pincode_hash, old_pin: $('#id_pincode').val()}, function (data) {
                $("#pin-status").html('')
                $('#id_newpincode').parent().removeClass('has-error');
                $('#id_pincode').parent().removeClass('has-error');
                $('#id_newpincode').parent().removeClass('has-success');
                $('#id_pincode').parent().removeClass('has-success');
                $('#id_pincode').next('span').removeClass('glyphicon-remove');
                    $('#id_newpincode').next('span').removeClass('glyphicon-remove');
                    $('#id_pincode').next('span').removeClass('glyphicon-ok');
                    $('#id_newpincode').next('span').removeClass('glyphicon-ok');
                if( data.pincode_error == true && data.new_pin_error == true) {
                    $('#id_pincode').parent().addClass('has-error');
                    $('#id_newpincode').parent().addClass('has-error');
                    $('#id_pincode').next('span').addClass('glyphicon-remove');
                    $('#id_newpincode').next('span').addClass('glyphicon-remove');
                } else if(data.pincode_error == true){
                    $('#id_pincode').parent().addClass('has-error');
                    $('#id_newpincode').parent().addClass('has-success');
                    $('#id_pincode').next('span').addClass('glyphicon-remove');
                    $('#id_newpincode').next('span').addClass('glyphicon-ok');
                } else if( data.new_pin_error == true ){
                    $('#id_newpincode').parent().addClass('has-error');
                    $('#id_pincode').parent().addClass('has-success');
                    $('#id_pincode').next('span').addClass('glyphicon-ok');
                    $('#id_newpincode').next('span').addClass('glyphicon-remove');
                } else {
                    $('#id_pincode').parent().addClass('has-success');
                    $('#id_newpincode').parent().addClass('has-success');
                    $('#id_pincode').next('span').addClass('glyphicon-ok');
                    $('#id_newpincode').next('span').addClass('glyphicon-ok');
                }
                console.log(data)
                if (data.success == true) {
                    $('#id_pincode').remove();
                    $('#id_newpincode').remove();
                    $('.btn').remove();
                    $("#action").html('<div class="alert alert-success" role="alert"><strong>PIN changed successfully</strong></div> <a href="#" onclick="generateWalletnote(amount.toString(), SN, pin); return false;" data-toggle="modal"  style="font-size: 25px;" data-target="#print-walletnote">Print walletnote</a>');
                }
        }, 'json');
    }
    function search () {
            $('#id_info').html('')
            $('#change-pincode').html('')
            $.get('http://' + location.host + '/walletnote/?id=' + $('#id_number').val().replace(/\s+/g, ''), function (data) {
                if (data) {
                    amount = data.cost * 1000
                    commission = data.commission * 1000
                    real_amount = data.real_amount * 1000
                    generateWalletnote(amount.toString(), data.number);
                    console.log(data)
                    var status
                    SN = data.number
                    if (data.status == 0) {
                        status = "This walletnote was not funded!";
                        $('#id_status').css('color', '#F7310B');
                        $('#id_status').html('Walletnote of ' + amount.toString() + 'm฿' + ' - ' + status + '<br>Commission: ' + commission.toString() + ' m฿');
                        $('#payoff-show-btn').css('display', 'none');
                    } else if (data.status == 1) {
                        status = "Awaiting confirmation from Bitcoin network"
                        $('#id_status').css('color', '#F7B50B');
                        $('#id_status').html('Walletnote of ' + amount.toString() + 'm฿' + ' - ' + status + '<br>Commission: ' + commission.toString() + ' m฿');
                        $('#payoff-show-btn').css('display', 'none');
                    } else if (data.status == 3) {
                         status = "Valid";
                         $('#id_status').css('color', '#b6c930');
                         $('#id_status').html('Walletnote of ' + amount.toString() + 'm฿' + ' - ' + status + '<br>Commission: ' + commission.toString() + ' m฿' + '<br />' + '<a href="#" onclick="return false;" data-toggle="modal" data-target="#print-walletnote">(Print walletnote)</a>');
                    }
                    
                    $('#payoff-form .info').html('<p>Standard redeem service fee 0.1% = ' + commission.toString() + ' m฿.</p><p>You will receive ' + real_amount.toString() + ' m฿ to your address</p>')
                    $('#controls-form').show();
                };
        }, 'json');
    }
    function payoff () {
        $.post('http://' + location.host + '/redeem/', {id: SN.replace(/\s+/g, ''), pincode: $('#id_pincode').val(), donate: $('#id_donate').prop('checked'), address: $('#id_address').val()}, function (data) {
                $("#payoff-status").html('')
                $('#id_address').parent().removeClass('has-error');
                $('#id_pincode').parent().removeClass('has-error'); 
                $('#id_address').parent().removeClass('has-success');
                $('#id_pincode').parent().removeClass('has-success');
                if( data.pincode_error == true && data.address_error == true) {
                    $('#id_address').parent().addClass('has-error');
                    $('#id_pincode').parent().addClass('has-error');
                } else if(data.pincode_error == true){
                    $('#id_pincode').parent().addClass('has-error');
                    $('#id_address').parent().addClass('has-success');
                } else if( data.address_error == true ){
                    $('#id_address').parent().addClass('has-error');
                    $('#id_pincode').parent().addClass('has-success');
                }else if( data.status_error == true ){
                    $("input, .btn").remove();
                    $("#action").html('<div class="alert alert-danger" role="alert"><strong>Status error!</strong> Walletnote is not valid!</div>');
                } else {
                    $('#id_address').parent().addClass('has-success');
                    $('#id_pincode').parent().addClass('has-success');
                }
                console.log(data)
                if (data.success == true) {
                    address = $('#id_address').val()
                    $("input, .btn").remove();
                    $("#action").html('<div class="alert alert-success" role="alert"><strong>Well done!</strong> Walletnote was redeemed sucsessfully</div><p>You can <a href="https://blockchain.info/address/' + address + '">track redeem transaction here</a></p>' + '.');
                }
        }, 'json');
    }

 $(document).ready(function () {
    $("#id_address").keyup(function () {
        if ($("#id_address").val()) {
            $("#action .status").html('<p>Redeem (0.1% fee will be charged) to ' + $("#id_address").val() + '</p>')
        }
    })
});

 $('.enter').click(function () { 
        $('#id_status').html('');
        $('#controls-form').hide();
        search();
    });

$('#changepin-show-btn').click(function () {
    $('#search-form').remove();
    $('#controls-form').remove();
    $('#changepin-form').show();

});

$('#payoff-show-btn').click(function () {
    $('#search-form').remove();
    $('#controls-form').remove();
    $('#changepin-form').remove()
    $('#payoff-form').show();
});

$('#id_donate').change(function () {
    if ($(this).prop('checked')) {
        $.get('http://' + location.host + '/calc-donate/?amount=' + amount/1000, function (data) {
            console.log(data.donate);
            donate = data.donate * 1000;
            d_amount = real_amount - donate;
            $("#id_donate").next("label").html("Support the project (add " + donate.toString() + " m฿ donation.)")
            $('#payoff-form .info').html('<p>Standard redeem service fee: 0.1% = ' + commission.toString() + ' m฿.</p><p>You will receive ' + d_amount.toString() + ' m฿ to your address</p>')
        });
    } else {
        $("#id_donate").next("label").html("Support us (add 0.5% donation.)");
        $('#payoff-form .info').html('<p>Standard redeem service fee 0.1% = ' + commission.toString() + ' m฿.</p><p>You will receive ' + real_amount.toString() + ' m฿ to your address</p>')
    }
});