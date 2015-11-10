define(['angular'], function () {
    'use strict';
    angular.module('jedi.filemodel', []).directive("jdFilemodel", [function () {
        return {
            scope: {
                jdFilemodel: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            //scope.jdFilemodel.data =   loadEvent.target.result;
                            scope.jdFilemodel = {
                                lastModified: changeEvent.target.files[0].lastModified,
                                lastModifiedDate: changeEvent.target.files[0].lastModifiedDate,
                                name: changeEvent.target.files[0].name,
                                size: changeEvent.target.files[0].size,
                                type: changeEvent.target.files[0].type,
                                data: loadEvent.target.result, 
                            };
                            
                        });
                    }
                    reader.readAsText(changeEvent.target.files[0]);
                });
            }
        }
    }]);
});