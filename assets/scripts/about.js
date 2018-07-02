/**
 * @author Yosviel Dominguezg <yosvield@gmail.com>
 */
var App;
var KONTO_ACCOUNT= "konto-account";

function init() {
    App = chrome.app.getDetails();

    $('#version').text('v' + App.version);
    $('.author').text(App.author);

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
    $('#btn-back').click(gotToBack);
}


$(document).ready(function () {
    init();
});