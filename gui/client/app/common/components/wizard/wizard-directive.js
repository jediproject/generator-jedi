"use strict";

define(['angular', 'jquery-steps'], function () {

    angular.module("jedi.wizard", []).directive('jdWizard', ['toastr', function(toastr) {
      return {
        scope: {
          stepChanging: '=',
          stepChanged: '=',
          finished: '&'
        },
        compile: function(tElement, tAttrs, transclude) {

          tElement.wrapInner('<div class="steps-wrapper">');

          var steps = tElement.children('.steps-wrapper').steps({
            headerTag: "h1",
            bodyTag: "form",
            labels: {
              finish: "Add"
            }
          });

          return function(scope, ele, attrs) {
            var forms = ele.find('form');

            ele.children('.steps-wrapper').on('stepChanged', function() {
              return scope.$apply(function() {
                if (tAttrs.stepChanged != null) {
                  return scope.stepChanged(ele.children('.steps-wrapper'));
                }
              });
            });

            ele.children('.steps-wrapper').on('finished', function() {
              return scope.$apply(function() {
                if (tAttrs.finished != null) {
                  return scope.finished();
                }
              });
            });

            return ele.children('.steps-wrapper').on('stepChanging', function(e, fromIndex, toIndex) {
              if (toIndex > fromIndex && forms[fromIndex] && forms[fromIndex].name && !scope.$parent.$eval(forms[fromIndex].name + '.$valid')) {
                  toastr.error('Informar campos orbrigatórios');
                  return false;
              }

              return scope.$apply(function() {
                if (tAttrs.stepChanging != null) {
                  return scope.stepChanging(ele.children('.steps-wrapper'));
                }
                return true;
              });
            });
          };
        }
      };
  }])

});