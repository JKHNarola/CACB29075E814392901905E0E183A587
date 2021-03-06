﻿var app = angular.module('app', ['ngSanitize', 'ui.bootstrap']);

//#region factories
app.factory('appUtils', function () {
    const {
        dialog
    } = require('electron').remote;
    var fs = require('fs');
    var path = require('path');
    var mm = require('musicmetadata');

    var obj = {};

    obj.onChanges = function (changes, property) {
        return changes[property] && changes[property].currentValue && changes[property].currentValue !== changes[property].previousValue;
    };

    obj.browseFolder = function () {
        const folders = dialog.showOpenDialog({
            title: 'Choose folder',
            properties: ['openDirectory']
        });
        if (!folders) return null;
        return folders;
    };

    obj.getFilesFromFolder = function (folder) {
        var finalFiles = [];
        if (!folder) {
            var folders = this.browseFolder();
            if (!folders) return finalFiles;
            folder = folders[0];
        }
        var files = this.getFiles(folder);
        files.forEach(function (x) {
            if (path.extname(x).toLowerCase() === ".mp3") finalFiles.push(x);
        });
        return finalFiles;
    };

    obj.getFiles = function (dir, filelist) {
        files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(function (file) {
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                filelist = obj.getFiles(path.join(dir, file), filelist);
            } else {
                filelist.push(path.join(dir, file));
            }
        });
        return filelist;
    };

    obj.readId3 = function (file) {
        return new Promise(function (resolve, reject) {
            mm(fs.createReadStream(file), function (err, metadata) {
                if (err)
                    reject(err);
                else {
                    resolve(metadata);
                }
            });
        });
    };
    return obj;
});

app.factory("localstorage", function ($window) {
    var obj = {};
    obj.setItem = function (key, value) {
        if (typeof value === 'object' && value !== null)
            value = JSON.stringify(value);
        $window.localStorage[key] = value;
    };
    obj.addItem = function (key, value) {
        obj.setItem(key, value);
    };
    obj.removeItem = function (key) {
        $window.localStorage.removeItem(key);
    };
    obj.getItem = function (key) {
        var val = $window.localStorage[key];
        try {
            return JSON.parse(val);
        } catch (e) {
            return val;
        }
    };
    obj.clear = function () {
        return $window.localStorage.clear();
    };
    obj.getToken = function () {
        var x = $window.localStorage["token"];
        if (!x) return "";
        return x;
    };
    return obj;
});

app.factory("messagebox", function ($uibModal) {
    var open = function (config) {
        var modalInstance = $uibModal.open({
            templateUrl: '../src/uitemplates/messagebox.tmpl.html',
            animation: true,
            keyboard: true,
            backdrop: 'static',
            size: config.size ? config.size : "md",
            controller: function ($scope, $uibModalInstance) {
                var vm = $scope;
                vm.title = config.title;
                vm.text = config.text;
                vm.subText = config.subText;
                vm.icon = config.icon;
                vm.isOk = config.isOk ? config.isOk : false;
                vm.isCancel = config.isCancel ? config.isCancel : false;
                vm.isYes = config.isYes ? config.isYes : false;
                vm.isNo = config.isNo ? config.isNo : false;
                vm.isCustomContent = config.isCustomContent ? config.isCustomContent : false;
                vm.content = config.content;
                vm.showIcon = config.showIcon ? config.showIcon : true;

                vm.onInit = function () {};

                vm.closePopup = function (t) {
                    $uibModalInstance.close(t);
                };

                vm.onInit();
            },
            windowClass: 'show',
            backdropClass: 'show'
        });
        modalInstance.result.then(function (res) {
            if (typeof res !== 'undefined') {
                switch (res) {
                    case "ok":
                        config.okCallback();
                        break;
                    case "cancel":
                        config.cancelCallback();
                        break;
                    case "yes":
                        config.yesCallback();
                        break;
                    case "no":
                        config.noCallback();
                        break;
                    default:
                        break;
                }
            }
        });
    };

    var obj = {};
    obj.showInfo = function (title, message, submessage, callback, size) {
        if (typeof callback === "undefined") callback = function () {
            return;
        };

        var config = {
            title: title,
            text: message,
            subText: submessage,
            icon: "info",
            isOk: true,
            okCallback: callback
        };
        open(config);
    };
    obj.showSuccess = function (title, message, submessage, callback, size) {
        if (typeof callback === "undefined") callback = function () {
            return;
        };

        var config = {
            title: title,
            text: message,
            subText: submessage,
            icon: "success",
            isOk: true,
            okCallback: callback
        };
        open(config);
    };
    obj.showError = function (title, message, submessage, callback, size) {
        if (typeof callback === "undefined") callback = function () {
            return;
        };

        var config = {
            title: title,
            text: message,
            subText: submessage,
            icon: "error",
            isOk: true,
            okCallback: callback,
            size: size
        };
        open(config);
    };
    obj.showWarning = function (title, message, submessage, callback, size) {
        if (typeof callback === "undefined") callback = function () {
            return;
        };

        var config = {
            title: title,
            text: message,
            subText: submessage,
            icon: "warning",
            isOk: true,
            okCallback: callback,
            size: size
        };
        open(config);
    };
    obj.showCustom = function (title, content, callback, size) {
        if (typeof callback === "undefined") callback = function () {
            return;
        };

        var config = {
            title: title,
            isOk: true,
            okCallback: callback,
            isCustomContent: true,
            content: content,
            size: size
        };
        open(config);
    };

    obj.confirm = function (title, message, submessage, okCallback, cancelCallback) {
        if (typeof okCallback === "undefined") throw new Error("okCallback not provided");
        if (typeof cancelCallback === "undefined") cancelCallback = function () {
            return;
        };

        var config = {
            title: title,
            text: message,
            subText: submessage,
            showIcon: false,
            isOk: true,
            isCancel: true,
            okCallback: okCallback,
            cancelCallback: cancelCallback,
            size: size
        };
        open(config);
    };
    obj.confirmYesNo = function (title, message, submessage, yesCallback, noCallback) {
        if (typeof yesCallback === "undefined") throw new Error("yesCallback is not provided!!");
        if (typeof noCallback === "undefined") throw new Error("noCallback is not provided!!");

        var config = {
            title: title,
            text: message,
            subText: submessage,
            showIcon: false,
            isYes: true,
            isNo: true,
            yesCallback: yesCallback,
            noCallback: noCallback,
            size: size
        };
        open(config);
    };
    obj.confirmCustom = function (title, content, okCallback, cancelCallback, size) {
        if (typeof okCallback === "undefined") throw new Error("okCallback not provided");
        if (typeof cancelCallback === "undefined") cancelCallback = function () {
            return;
        };

        var config = {
            title: title,
            isCustomContent: true,
            content: content,
            isOk: true,
            isCancel: true,
            okCallback: okCallback,
            cancelCallback: cancelCallback,
            size: size
        };
        open(config);
    };
    obj.confirmCustomYesNo = function (title, content, yesCallback, noCallback, size) {
        if (typeof yesCallback === "undefined") throw new Error("yesCallback is not provided!!");
        if (typeof noCallback === "undefined") throw new Error("noCallback is not provided!!");

        var config = {
            title: title,
            isCustomContent: true,
            content: content,
            isYes: true,
            isNo: true,
            yesCallback: yesCallback,
            noCallback: noCallback,
            size: size
        };
        open(config);
    };

    return obj;
});

app.factory("snackbar", function () {
    var show = function (config) {
        var maindiv = '<div id="snbarea" class="col-sm-6 notification-area"></div> ';
        if (!document.getElementById("snbarea")) {
            var wrapper = document.createElement('div');
            wrapper.classList = ['row'];
            wrapper.innerHTML = maindiv;
            document.body.appendChild(wrapper);
        }
        var dt = new Date();
        var snbid = "snb" + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + dt.getMilliseconds().toString();

        var i = "";
        if (!config.icon) config.icon = "";
        switch (config.icon.toString().toLowerCase()) {
            case "i":
            case "info":
            case "information":
                i = "zmdi-info text-info";
                break;
            case "e":
            case "error":
            case "err":
                i = "zmdi-close-circle text-danger";
                break;
            case "s":
            case "success":
                i = "zmdi-check-circle text-success";
                break;
            case "w":
            case "warn":
            case "warning":
                i = "zmdi-alert-circle text-warning";
                break;
            default:
                i = "zmdi-info text-info";
                break;
        }

        var snb = '<table class="notification" cellspacing="10"><tr><td style="width:50px;"><i style="font-size: 40px;" class="zmdi ' + i + ' " aria-hidden="true"></i> </td> <td> <span class="message">' + config.message + '</span> </td>';
        if (config.isRetry && config.retryCallback)
            snb += '<td align="right" width="0"><div id="' + snbid + 'retry" class="btn btn-lnk text-warning"><strong>RETRY</strong></div></td>';
        if (config.isClose)
            snb += '<td align="right" width="0"><div id="' + snbid + 'close" class="btn btn-lnk text-info"><strong>CLOSE</strong></div></td>';
        snb += '</tr></table>';

        var d = document.createElement("div");
        d.id = snbid;
        d.innerHTML = snb;
        d.classList.add(['bounceInLeft']);
        document.getElementById("snbarea").appendChild(d);

        var close = function () {
            var f = document.getElementById(snbid);
            if (f) $("#" + snbid).fadeOut("fast", null, function () {
                $(this).remove();
            });
            if (config.retryCallback) config.retryCallback = function () {};
            if (config.closeCallback) config.closeCallback();
        };

        var closeAndRetry = function () {
            config.closeCallback = function () {};
            $("#" + snbid).fadeOut("fast", null, function () {
                $(this).remove();
            });
            if (config.retryCallback) config.retryCallback();
        };

        var cl = document.getElementById(snbid + "close");
        if (cl) cl.addEventListener("click", close);

        var r = document.getElementById(snbid + "retry");
        if (r) r.addEventListener("click", closeAndRetry);

        if (config.timeout) {
            setTimeout(close, config.timeout);
        }
    };

    var obj = {};
    obj.showInfo = function (message, timeout, displayClose, closeCallback, retryCallback) {
        var c = {
            message: message,
            icon: "info",
            isClose: displayClose,
            timeout: timeout,
            closeCallback: closeCallback,
            isRetry: retryCallback ? true : false,
            retryCallback: retryCallback
        };
        if (!timeout) c.isClose = true;
        show(c);
    };
    obj.showError = function (message, timeout, displayClose, closeCallback, retryCallback) {
        var c = {
            message: message,
            icon: "err",
            isClose: displayClose,
            timeout: timeout,
            closeCallback: closeCallback,
            isRetry: retryCallback ? true : false,
            retryCallback: retryCallback
        };
        if (!timeout) c.isClose = true;
        show(c);
    };
    obj.showWarning = function (message, timeout, displayClose, closeCallback, retryCallback) {
        var c = {
            message: message,
            icon: "warn",
            isClose: displayClose,
            timeout: timeout,
            closeCallback: closeCallback,
            isRetry: retryCallback ? true : false,
            retryCallback: retryCallback
        };
        if (!timeout) c.isClose = true;
        show(c);
    };
    obj.showSuccess = function (message, timeout, displayClose, closeCallback, retryCallback) {
        var c = {
            message: message,
            icon: "success",
            isClose: displayClose,
            timeout: timeout,
            closeCallback: closeCallback,
            isRetry: retryCallback ? true : false,
            retryCallback: retryCallback
        };
        if (!timeout) c.isClose = true;
        show(c);
    };
    return obj;
});

app.factory("player", function ($rootScope, appUtils) {
    const {
        Howl
    } = require('howler');
    var tmpCurrId = 0;
    var player = {};
    player.nowplaying = [];
    player.sound;
    player.loop = false;
    player.currIndex = 0;
    player.isPlaying = false;

    player.pickFiles = function () {
        var files = appUtils.getFilesFromFolder();

        if (files) {
            player.nowplaying = files;
        }

        player.open(player.currIndex);
    };

    player.open = function (index) {
        if (player.sound) player.sound.unload();
        player.sound = undefined;
        player.sound = new Howl({
            src: [player.nowplaying[index]],
            autoplay: false,
            loop: player.loop,
            onend: function () {
                player.isPlaying = false;
            },
            onplay: function () {
                $rootScope.$emit("onDurationChanged", this.duration());
            }
        });

        player.sound.play();
        player.isPlaying = true;
    };

    player.playPause = function () {
        if (player.sound) {
            if (player.sound.playing()) {
                player.sound.pause();
                player.isPlaying = false;
            } else {
                tmpCurrId = player.sound.play();
                player.isPlaying = true;
            }
        }
    };

    player.stop = function () {
        if (player.sound) player.sound.stop();
        player.isPlaying = false;
    };

    player.getCurrent = function () {
        if (player.nowplaying.length > 0)
            return player.nowplaying[player.currIndex];
        return null;
    };

    player.playNext = function () {
        if (player.currIndex < player.nowplaying.length) player.currIndex = player.currIndex + 1;
        player.open(player.currIndex);
    };

    player.playPrev = function () {
        if (player.currIndex > 0) player.currIndex = player.currIndex - 1;
        player.open(player.currIndex);
    };

    player.stop = function () {
        if (player.sound) player.sound.stop();
        player.isPlaying = false;
    };

    player.getDuration = function () {
        if (player.sound) return player.sound.duration();
        return null;
    }

    player.getCurrpos = function () {
        if (player.sound) {
            var x = player.sound.seek();
            if (typeof x == 'number') return x;
        }
        return 0;
    }

    player.seek = function (s) {
        if (player.sound) player.sound.seek(s);
    }

    player.getVolume = function () {
        if (player.sound) return player.sound.volume();
        return 0;
    }

    player.setVolume = function (value) {
        if (player.sound) player.sound.volume(value);
    }

    return player;
});

app.factory("visualizer", function () {
    const {
        Howler
    } = require('howler');

    var obj = {};

    var analyser;
    var dataArray;
    var bufferLength;
    var WIDTH;
    var HEIGHT;
    var barWidth;
    var barHeight;
    var x;
    var canvas;
    var ctx;
    obj.start = function () {
        if (Howler.ctx) {
            canvas = document.getElementById("canvas");
            ctx = canvas.getContext("2d");

            analyser = Howler.ctx.createAnalyser();
            Howler.masterGain.connect(analyser);
            bufferLength = analyser.frequencyBinCount / 8;
            dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);

            analyser.fftSize = 256;
            WIDTH = canvas.width;
            HEIGHT = canvas.height;

            barWidth = (WIDTH / bufferLength) * 2.5;
            renderFrame();
        }
    };

    var renderFrame = function () {
        requestAnimationFrame(renderFrame);

        x = 0;

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            var r = barHeight + (25 * (i / bufferLength));
            var g = 250 * (i / bufferLength);
            var b = 50;

            ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    };

    // var analyser, buffLen, barWidth, dataArray, ctx;
    // obj.start = function () {
    //     analyser = Howler.ctx.createAnalyser();
    //     Howler.masterGain.connect(analyser);
    //     buffLen = analyser.frequencyBinCount;
    //     dataArray = new Uint8Array(buffLen);
    //     analyser.getByteTimeDomainData(dataArray);
    //     analyser.fftSize = 256;

    //     var canvas = document.getElementById("canvas");
    //     ctx = canvas.getContext("2d");
    //     barWidth = canvas.width / (buffLen) * 2.5;
    //     console.log(barWidth);
    //     ctx.fillStyle = "black";
    //     ctx.strokeStyle = "white";
    //     ctx.lineCap = "round";
    //     ctx.lineWidth = barWidth;

    //     draw();
    // };

    // draw = function () {
    //     ctx.fillRect(0, 0, 500, 180);
    //     analyser.getByteFrequencyData(dataArray);
    //     for (var i = 0; i < buffLen; i++) {
    //         ctx.beginPath();
    //         ctx.moveTo(4 + 2 * i * barWidth + barWidth / 2, 178 - barWidth / 2);
    //         ctx.lineTo(4 + 2 * i * barWidth + barWidth / 2, 178 - dataArray[i] * 0.65 - barWidth / 2);
    //         ctx.stroke();

    //     }
    //     requestAnimationFrame(draw);
    // }
    return obj;
});
//#endregion factories

//#region filters
app.filter('trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);
//#endregion

//#region directives
app.directive('numberOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});

app.directive('capitalizeFirst', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            var capitalize = function (inputValue) {
                if (inputValue) {
                    var capitalized = inputValue.charAt(0).toUpperCase() + inputValue.substring(1);

                    if (capitalized !== inputValue) {
                        ngModel.$setViewValue(capitalized);
                        ngModel.$render();
                    }
                    return capitalized;
                }
            };

            var model = $parse(attr.ngModel);
            ngModel.$parsers.push(capitalize);
            capitalize(model(scope));
        }
    };
});

app.directive('capitalizeAll', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            var capitalize = function (inputValue) {
                if (inputValue) {
                    var capitalized = inputValue.replace(/^(.)|\s(.)/g, function (v) {
                        return v.toUpperCase();
                    });

                    if (capitalized !== inputValue) {
                        ngModel.$setViewValue(capitalized);
                        ngModel.$render();
                    }
                    return capitalized;
                }
            };

            //Push process function to model
            //Apply it right now
            var model = $parse(attr.ngModel);
            ngModel.$parsers.push(capitalize);
            capitalize(model(scope));
        }
    };
});

app.directive('restrictInput', function () {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var ele = element[0];
            var regex = RegExp(attrs.restrictInput);
            var value = ele.value;
            ele.addEventListener('keyup', function (e) {
                if (regex.test(ele.value) || ele.value === '') value = ele.value;
                else ele.value = value;
            });
        }
    };
});

app.directive('convertToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (val) {
                return val ? parseInt(val, 10) : null;
            });
            ngModel.$formatters.push(function (val) {
                return val ? '' + val : null;
            });
        }
    };
});

app.directive("compareTo", function () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function (modelValue) {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
});
//#endregion