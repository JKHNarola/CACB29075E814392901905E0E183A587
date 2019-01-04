app.controller('mainCtrl', function ($scope, $interval, $rootScope, player, snackbar, messagebox, appUtils) {
    $scope.isPlaying = false;
    $scope.currPos = 0;
    $scope.duration = 0;
    $scope.title = "";
    $scope.album = "";
    $scope.artists = "";
    $scope.coverpic = "";
    $scope.seekbarStyle = {
        'width': '0%'
    };
    $scope.volumeStyle = {
        'width': '100%'
    };

    var registerOnDurationChanged;
    $scope.onInit = function () {
        registerOnDurationChanged = $rootScope.$on("onDurationChanged", function (e, d) {
            $scope.duration = d;
        });

        player.pickFiles();
        onSongChange();
        $scope.startSeekbar();
    };

    var onSongChange = function () {
        if (player.nowplaying.length > 0) {
            $scope.isPlaying = true;
            appUtils.readId3(player.nowplaying[player.currIndex]).then(function (d) {
                console.log(d);
                $scope.title = d.title;
                $scope.album = d.album;
                $scope.artists = d.artist.join(", ");
                if (d.picture && d.picture.length > 0)
                    $scope.coverpic = "data:image/png;base64," + Buffer.from(d.picture[0].data).toString('base64');
            }).catch(function (e) {
                console.log(e)
            });
        }
    };

    $scope.onPlayPause = function () {
        player.playPause();
        $scope.isPlaying = player.isPlaying;
    };

    $scope.onNext = function () {
        player.playNext();
        $scope.isPlaying = player.isPlaying;
        onSongChange();
    };

    $scope.onPrev = function () {
        player.playPrev();
        $scope.isPlaying = player.isPlaying;
        onSongChange();
    };

    var updateSeekbar;
    $scope.startSeekbar = function () {
        if (angular.isDefined(updateSeekbar)) return;

        updateSeekbar = $interval(function () {
            if (player.isPlaying) {
                $scope.currPos = player.getCurrpos();
                var per = (100 / $scope.duration) * $scope.currPos;
                $scope.seekbarStyle = {
                    'width': per.toString() + "%"
                };
            }
        }, 250);
    };

    $scope.stopSeekbar = function () {
        if (angular.isDefined(updateSeekbar)) {
            $interval.cancel(updateSeekbar);
            updateSeekbar = undefined;
        }
    };

    $scope.onSeek = function (e) {
        var x = e.offsetX;
        var w = e.target.offsetWidth;
        var d = player.getDuration();
        var s = (d / w) * x;
        player.seek(s);
    };

    $scope.onVolumeChange = function (e) {
        var x = e.offsetX;
        var w = e.target.offsetWidth;
        var s = (1 / w) * x;
        player.setVolume(s);
        var per = (100 / 1) * player.getVolume();
        $scope.volumeStyle = {
            'width': per.toString() + "%"
        };
    };

    this.$onDestroy = function () {
        registerOnDurationChanged();
    };
});