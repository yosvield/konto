/**
 * @author Yosviel Dominguezg <yosvield@gmail.com>
 */
var user;
var KONTO_ACCOUNT = "konto-account";
var show_bar_btn=false;
var show_bar_more=true;

function init() {
    user = JSON.parse(localStorage.getItem(KONTO_ACCOUNT));

    if (user !== null) {
        $('.data-username').html(user.username);
        $('.data-cuota').html(user.used_quota + '/' + user.quota);
        var percente = Number(((user.used_quota * 100) / user.quota).toFixed(2));
        $('#data-porciento').attr('data-badge', percente + '%');
        $('#data-porciento').addClass(getState(percente));
        document.querySelector('#data-porciento').addEventListener('mdl-componentupgraded', function () {
            this.MaterialProgress.setProgress(percente);
        });

        var avatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAER0lEQVRYhc1YTVPyOhg9SegH4EKKI3UYBwdGN++g//9nKDvGBeA4Mo60LoSWtEnfhZPctPLR1uu9PrtC8uT0+TonJfP5PMMvNvp/Azhmvx5go+7GLKtWGYSQWufUiqACZx5KCAFjDIyxL7+be6pa5QhmWZY7lFIKSim22y3iOAYAuK4Lx3EgpYSUMre+aiQrAVQHZFmGLMvQaDSw2Wwwm80QBAGSJAEAWJYFz/NwdXWFVquFNE1BCNF7q4AkVcaMSpMC9/7+joeHB8RxjEajAUo/K0ZKiTRN4boubm9vcXp6qkEC1eqxUg2qCFBKEccxJpMJkiSB4zgaHABQSuE4DpIkwWQyQRzHoJTWSnElgCqCjDEsFgtEUQTGGKSUuSbIsgxSSjDGEEURFosFGGM5H2WtVg0mSYIgCMAY2xkVsykYY7o+69Rg5RQrgJxzUEoPHkYIAaUUnHMN8EdTXASqunmfqf/rAKsFUB1o2zZc14WUUv++ay3w2dGu68K27aMv9G2AKmqMMfR6PUgpdfcWmwT47GYpJXq93t56/dcBEkKQpin6/T48z8N2u/2SQvW83W7heR76/X5uWP8YQHNQE0IwHo/R7XbBOUeappra0jQF5xzdbhfj8VhH3vRR1ioxiWlmepfLJV5fX3NcfH5+Dt/3QQiBECI3yH8UYFEsAJ/cqyIHQNOe4ub/TCyYIE3jnOeAKKDflVqlAR46QOnAYmQU3RX3ms9lonkQYFGYmuNDcXCSJNhsNthut7kUO44Dx3FgWRYopRBC6LlZ9HcI6F6A5mZTJADAx8cHgiBAGIZYr9fgnEMIkdvDGINt22i32+h0OvA8DycnJwAAIUTO96HaPNokajNjDKvVCk9PTwjDUHOr4uNdKTbTbFkWOp0OLi8v0e129QsdS/NOgMU6EUJgOp3i5eVFi1Wl78oYIUR3OSEEFxcXuLm50exirivazhSbskgIgfv7ewRBANu29ZpiPe0zM4WWZQEAnp+fEUUR7u7ujlLgzumpnDLGMJvNsFqtNDizzsp0oblO7bVtG6vVCrPZTAPcl429AFVawjDMqeG6skmBNRsuDEN966sE0EzxYDDIgfvO0C36GAwGR1X2XoBKtfi+j9FohCRJvlw7qwAz9yZJgtFoBN/3j6qcnU1ivlGaphgOhwCAx8dH/fXABLnPebFehRAQQuD6+hrD4bDUffloF2dZpkG2Wi1Mp1NEUaQZ4hgNqlrmnKPZbOLPnz86csWzdvo4NKiLKbUsC1EUYT6fY7lcgnO+c1gXh7Rt2/B9H4PBAM1mM3eBOtZ4pZkE+EcDMsawXq/x9vaGIAiwXq+1YAU+ubrRaKDdbsPzPJydnaHdbms+Nq8JtZhkF0ggPyaKgkHxMQDNw/uEQhmRoKyU3Cp2rqordShjDK1W60uKVVPs81HGSgtW0+EujXds7NQd8rUU9XfYpKr9+m/Uvx7gX2fgNQgwx/FjAAAAAElFTkSuQmCC";
        if (user.avatar !== undefined && user.avatar !== "") {
            avatar = user.avatar;
        }
        document.getElementById("img-perfil").style.background = 'url(' + avatar + ') no-repeat center';

        if (!user.has_connected) {
            $('.bar-status').removeClass('hidden');
        }
    } else {
        document.location.href = 'login.html';
    }
    suscribEvent();
}

function getState(percente) {
    if (percente <= 60)
        return "cuota_low";
    else if (percente <= 80)
        return "cuota_medium";
    else
        return 'cuota_high';
}
function stop() {
    chrome.runtime.getBackgroundPage(function (extension) {
        extension.Konto.logout();

        document.location.href = 'login.html';
    });
}

function encodeImageFileAsURL() {

    var filesSelected = document.getElementById("file-img-input").files;
    if (filesSelected.length > 0) {
        var fileToLoad = filesSelected[0];

        var fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent) {
            var srcData = fileLoadedEvent.target.result; // <--- data: base64
            document.getElementById("img-perfil").style.background = 'url(' + srcData + ') no-repeat center';

            user = JSON.parse(localStorage.getItem(KONTO_ACCOUNT));
            user.avatar = srcData;
            var user_to_save = JSON.stringify(user);
            localStorage.setItem(KONTO_ACCOUNT, user_to_save);
        }
        fileReader.readAsDataURL(fileToLoad);
    }
}


function hoverOnBarMore() {
    if(show_bar_more && !show_bar_btn){
        show_bar_more = !show_bar_more;
        show_bar_btn = !show_bar_btn;
        $($('tr').find('.btn-more')).toggle();
        $($('tr').find('.bar-btn')).toggle();
    }
}

function hoverOffBarBtn() {
    if(!show_bar_more && show_bar_btn){
        show_bar_more = !show_bar_more;
        show_bar_btn = !show_bar_btn;
        $($('tr').find('.btn-more')).toggle();
        $($('tr').find('.bar-btn')).toggle();
    }
}


function suscribEvent() {
    $('#btn-stop').click(stop);
    $('#file-img-input').change(encodeImageFileAsURL);
    $('.btn-more').hover(hoverOnBarMore);
    $('.bar-btn').hover(null, hoverOffBarBtn);
}

$(document).ready(function () {
    init();
});