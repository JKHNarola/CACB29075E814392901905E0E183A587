app.controller('mainCtrl', function ($scope, $interval, $rootScope, player, snackbar, messagebox, appUtils, visualizer) {
    $scope.isPlaying = false;
    $scope.currPos = 0;
    $scope.duration = 0;
    $scope.title = "";
    $scope.album = "";
    $scope.artists = "";
    $scope.coverpic = "";
    $scope.volume = 0.5;

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
                $scope.title = d.title;
                $scope.album = d.album;
                $scope.artists = d.artist.join(", ");
                if (d.picture && d.picture.length > 0)
                    $scope.coverpic = "data:image/png;base64," + Buffer.from(d.picture[0].data).toString('base64');
            }).catch(function (e) {
                console.log(e)
            });

            visualizer.start();
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
            if (player.isPlaying && !$scope.isSeeking) {
                $scope.currPos = player.getCurrpos();
            }
        }, 1000);
    };

    $scope.stopSeekbar = function () {
        if (angular.isDefined(updateSeekbar)) {
            $interval.cancel(updateSeekbar);
            updateSeekbar = undefined;
        }
    };

    $scope.onSeek = function (v) {
        player.seek(v);
    };

    $scope.onVolumeChange = function () {
        player.setVolume($scope.volume);
    };

    this.$onDestroy = function () {
        registerOnDurationChanged();
    };
});