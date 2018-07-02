/**
 * @author Yosviel Dominguezg <yosvield@gmail.com>
 */
var KONTO_TIME_RELOAD= "konto-time-reload";
var KONTO_PIBOT= "konto-pibot";
var KONTO_SHOW_NOTIFICATION= "konto-show-notification";
var KONTO_ACCOUNT= "konto-account";

function init() {
    $('#time-reload').val(localStorage.getItem(KONTO_TIME_RELOAD));
    $('#pibot').val(localStorage.getItem(KONTO_PIBOT));

    if (localStorage.getItem(KONTO_SHOW_NOTIFICATION) == 'true') {
        $('#show-notification').attr('checked', 'checked');
        $('#container-pibot').removeClass('is-disabled');
        $('#pibot').removeAttr('disabled');
    } else {
        $('#show-notification').removeAttr('checked');
        $('#container-pibot').addClass('is-disabled');
        $('#pibot').attr('disabled', 'disabled');
    }

    suscribEvent();
}

function gotToBack() {
    var user=JSON.parse(localStorage.getItem(KONTO_ACCOUNT));
    if ( user != null && user.login) {
        document.location.href = 'popup.html';
    }else{
        document.location.href = 'login.html';
    }
}

function suscribEvent() {
    $('#show-notification').change(function () {
        if($(this).attr('checked') === 'checked'){
            localStorage.setItem(KONTO_SHOW_NOTIFICATION, true);
            $('#container-pibot').removeClass('is-disabled');
            $('#pibot').removeAttr('disabled');
        }else {
            localStorage.setItem(KONTO_SHOW_NOTIFICATION, false);
            $('#container-pibot').addClass('is-disabled');
            $('#pibot').attr('disabled', 'disabled');
        }
    });

    $('#time-reload').change(function () {
        localStorage.setItem(KONTO_TIME_RELOAD, $(this).val() === '' ? 2 : $(this).val());
    });

    $('#pibot').change(function () {
        localStorage.setItem(KONTO_PIBOT, $(this).val() === '' ? 0.05 : $(this).val());
    });

    $('#btn-back').click(gotToBack);
}

$(document).ready(function () {
    init();
});