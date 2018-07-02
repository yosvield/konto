/**
 * Pagina que se ejecuta en background
 *
 * @author Yosviel Dominguez <yosvield@gmail.com>
 */
var urlServer = "https://cuota.uci.cu/php/cuota.php";


var animationFrames = 36;
var animationSpeed = 10; // ms
var rotation = 0;
var loggedInImage = document.getElementById('logged_in');
var canvas = document.getElementById('canvas');
var canvasContext = canvas.getContext('2d');

var TypeNotification = {
    lastConsumo: 1,
    errorLogin: 2
};

var TypeStateCuota = {
    low: {id: 1, class_css: 'cuota_low', color_css: '#32bf57'},
    medium: {id: 2, class_css: 'cuota_medium', color_css: '#f5ca48'},
    high: {id: 3, class_css: 'cuota_high', color_css: '#ff3f38'}
};

var notifications = [];

Konto = {
    KONTO_PIBOT: "konto-pibot",
    KONTO_SAVE_PASS: "konto-save-pass",
    KONTO_TIME_RELOAD: "konto-time-reload",
    KONTO_SHOW_NOTIFICATION: "konto-show-notification",

    KONTO_ACCOUNT: "konto-account",

    user: {
        username: '',
        password: '',
        login: false,
        quota: 0,
        used_quota: 0,
        last_used_quota: 0,
        has_connected: false,
        avatar: ''
    },

    getSetting: function ($key) {
        if (localStorage.getItem($key) == undefined) {
            Konto.resetConfig();
        }
        return localStorage.getItem($key);
    },
    setSetting: function ($value, $key) {
        localStorage.setItem($key, $value);
    },
    saveUser: function ($user) {
        if ($user === undefined) {
            $user = Konto.user;
        }
        var user_to_save = JSON.stringify($user);
        localStorage.setItem(Konto.KONTO_ACCOUNT, user_to_save);
    },
    getUser: function () {
        var user_saved = localStorage.getItem(Konto.KONTO_ACCOUNT);
        if (user_saved == null || user_saved == 'null' || user_saved == '' || user_saved == undefined || user_saved == 'undefined') {
            return undefined;
        } else {
            Konto.user = JSON.parse(user_saved);
            return Konto.user;
        }
    },
    login: function ($username, $password, callback) {
        Konto.user.username = $username;
        Konto.user.password = $password;

        Konto.saveUser();
        Konto.search(true, callback);
    },
    logout: function () {
        localStorage.removeItem(Konto.KONTO_ACCOUNT);
        Konto.setSetting(false, Konto.KONTO_SAVE_PASS);
        updateIcon();
        chrome.alarms.clear('update');
    },
    resetConfig: function () {
        Konto.setSetting(2, Konto.KONTO_TIME_RELOAD);
        Konto.setSetting(true, Konto.KONTO_SHOW_NOTIFICATION);
        Konto.setSetting(0.05, Konto.KONTO_PIBOT);
        Konto.setSetting(false, Konto.KONTO_SAVE_PASS);
    },
    search: function (notifiyError, callback) {
        var user = Konto.getUser();
        if (user !== undefined && user.username !== null && user.username !== "" && user.password != "null" && user.password !== "") {
            $.ajax({
                type: "POST",
                url: urlServer,
                timeout: 10000,
                data: {
                    username: user.username,
                    userpassword: user.password
                }
            }).done(function (response) {
                user.has_connected = true;
                response = JSON.parse(response.replace('success', '"success"').replace('data', '"data"').replace('msg', '"msg"'));

                if (response.success) {
                    var data = response.data;
                    user.quota = data.cuota;
                    user.used_quota = Number(data.cuota_usada.toFixed(2));

                    if ((user.used_quota - user.last_used_quota) > Number(Konto.getSetting(Konto.KONTO_PIBOT))) {
                        notification(TypeNotification.lastConsumo, user);
                    }
                    user.last_used_quota = Number(data.cuota_usada.toFixed(2));
                    user.login = true;

                    Konto.saveUser(user);
                    animateFlip();
                    updateIcon(user);
                } else {
                    if (notifiyError) {
                        notification(TypeNotification.errorLogin, response.msg);
                    }
                }
                if (callback !== undefined) {
                    callback(response.success, user);
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                user.has_connected = false;
                Konto.saveUser(user);
                updateIcon(user);
                if (callback !== undefined) {
                    callback(false, user);
                }
            }).always(function () {
                chrome.alarms.create('update', {delayInMinutes: Number(Konto.getSetting(Konto.KONTO_TIME_RELOAD))});
            });
        } else {
            if (callback !== undefined) {
                callback(false, user);
            }
        }
    },
    getStateCuota: function (user) {
        var percente = Number(((user.used_quota * 100) / user.quota).toFixed(2));
        if (percente <= 60)
            return TypeStateCuota.low;
        else if (percente <= 80)
            return TypeStateCuota.medium;
        else
            return TypeStateCuota.high;
    }
};

notification = function notification(type, data) {
    var showNotification = Konto.getSetting(Konto.KONTO_SHOW_NOTIFICATION);
    if (window.Notification && ( showNotification === 'true' || showNotification === true || type === TypeNotification.errorLogin)) {
        clearNotification();

        var titlemsg = '';
        var bodymsg = '';
        if (type === TypeNotification.lastConsumo) {
            var usedCuota = data.used_quota;
            var consumo = usedCuota - data.last_used_quota;
            titlemsg = 'Último consumo ' + consumo.toFixed(2) + ' mb.';
            bodymsg = 'Estado de su cuota ' + usedCuota + '/' + data.quota + ' mb.';
        }

        if (type === TypeNotification.errorLogin) {
            titlemsg = 'A ocurrido un error.';
            bodymsg = data;
        }

        var notification = new Notification(titlemsg, {
            icon: 'assets/images/icon-48.png',
            body: bodymsg
        });

        notification.onclose = function (es) {
            var firstNotification = notifications.shift();
        };
        notification.onshow = function (es) {
            notifications.push(notification);
        }
    }
}

/**
 * Limpia las notificaciones activas, asi solo deja 2 para que se muestre la 3era
 */
function clearNotification() {
    if (notifications.length > 2) {
        var firstNotification = notifications[0];
        setInterval(firstNotification.close.bind(firstNotification), 1);
    }
}

updateIcon = function updateIcon(user) {
    var text = '', color = '#eb9f98';
    if (user !== undefined) {
        if (user.has_connected) {
            var usedCuota = user.used_quota;
            var cuenta = usedCuota !== '' && usedCuota !== null ? usedCuota.toFixed() : '';
            text = cuenta.toString();
            color = Konto.getStateCuota(user).color_css;
        } else {
            text = '?';
            color = '#eb9f98'
        }
    }

    chrome.browserAction.setBadgeText({text: text});
    chrome.browserAction.setBadgeBackgroundColor({color: color});
}

//<editor-fold desc="Animation">
function ease(x) {
    return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
}

function animateFlip() {
    rotation += 1 / animationFrames;
    drawIconAtRotation();

    if (rotation <= 1) {
        setTimeout(animateFlip, animationSpeed);
    } else {
        rotation = 0;
    }
}

function drawIconAtRotation() {
    canvasContext.save();
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.translate(
        Math.ceil(canvas.width / 2),
        Math.ceil(canvas.height / 2));
    canvasContext.rotate(2 * Math.PI * ease(rotation));
    canvasContext.drawImage(loggedInImage,
        -Math.ceil(canvas.width / 2),
        -Math.ceil(canvas.height / 2));
    canvasContext.restore();

    chrome.browserAction.setIcon({
        imageData: canvasContext.getImageData(0, 0,
            canvas.width, canvas.height)
    });
}
//</editor-fold>

function onAlarm(alarm) {
    Konto.search(false);
}

chrome.alarms.onAlarm.addListener(onAlarm);

//guardar la configuracion por defecto caundo se instala
chrome.runtime.onInstalled.addListener(function (details) {
    if (details && details.reason && details.reason == 'install') {
        Konto.resetConfig();
    }
});

chrome.runtime.onStartup.addListener(function () {
    chrome.alarms.clear('update');
    if (Konto.getSetting(Konto.KONTO_SAVE_PASS) == 'true') {
        Konto.search(true);
    }else{
        localStorage.removeItem(Konto.KONTO_ACCOUNT);
    }
});