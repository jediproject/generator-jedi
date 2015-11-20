    angular.module("jedi.loading.directives", []).directive("jdLoading", [function () {
        return {
            restrict: 'E',
            templateUrl: function (elem, attrs) {
                if (attrs.templateUrl) {
                    return attrs.templateUrl;
                } else {
                    return "assets/libs/ng-jedi-loading/loading.html";
                }
            }
        };
    }]).run(['$templateCache', function($templateCache) {
        $templateCache.put('assets/libs/ng-jedi-loading/loading.html',  '<div class="modal" id="loadingModal" data-backdrop="static">'+
                                                                        '    <div class="outer">'+
                                                                        '        <div class="inner">'+
                                                                        '            <div class="modal-dialog text-center">'+
                                                                        '                <div class="sk-fading-circle">'+
                                                                        '                    <div class="sk-circle1 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle2 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle3 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle4 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle5 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle6 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle7 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle8 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle9 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle10 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle11 sk-circle"></div>'+
                                                                        '                    <div class="sk-circle12 sk-circle"></div>'+
                                                                        '                </div>'+
                                                                        '            </div>'+
                                                                        '        </div>'+
                                                                        '    </div>'+
                                                                        '</div>');
    }]);