app.controller('mainCtrl', function ($scope, $interval, $rootScope, player, snackbar, messagebox) {
    $scope.isPlaying = false;
    $scope.currPos = 0;
    $scope.duration = 0;
    $scope.seekbarStyle = {
        'width': '0%'
    };

    var registerOnDurationChanged;
    $scope.onInit = function () {
        registerOnDurationChanged = $rootScope.$on("onDurationChanged", function (e, d) {
            $scope.duration = d;
        });

        player.pickFiles();
        $scope.startSeekbar();
    };

    $scope.onPlayPause = function () {
        player.playPause();
        $scope.isPlaying = player.isPlaying;
    };

    $scope.onNext = function () {
        player.playNext();
        $scope.isPlaying = player.isPlaying;
    };

    $scope.onPrev = function () {
        player.playPrev();
        $scope.isPlaying = player.isPlaying;
    };

    var updateSeekbar;
    $scope.startSeekbar = function () {
        if (angular.isDefined(updateSeekbar)) return;

        updateSeekbar = $interval(function () {
            if (player.isPlaying) {
                $scope.currPos = player.getCurrpos();
                var per = (100 / $scope.duration) * $scope.currPos;
                $scope.seekbarStyle = {
                    'width': per.toString()
                };
            }
        }, 500);
    };

    $scope.stopSeekbar = function () {
        if (angular.isDefined(updateSeekbar)) {
            $interval.cancel(updateSeekbar);
            updateSeekbar = undefined;
        }
    };

    this.$onDestroy = function () {
        registerOnDurationChanged();
    };
});