"use strict";

define(['angular', 'jquery-steps'], function () {

    angular.module("jedi.wizard", []).directive('jdWizard', [function() {
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
          return {
            pre: function(scope, ele, attrs) {},
            post: function(scope, ele, attrs) {
              var forms = ele.find('form');
              ele.children('.steps-wrapper').on('stepChanged', function() {
                return scope.$apply(function() {
                  if (tAttrs.stepChanged != null) {
                    return scope.stepChanged(ele.children('.steps-wrapper'));
                  }
                });
              });
              ele.children('.steps-wrapper').on('canceled', function() {
                  console.log('canceled');
              });
               ele.children('.steps-wrapper').on('contentLoaded', function() {
                  console.log('contentLoaded');
              });
                ele.children('.steps-wrapper').on('finishing', function() {
                console.log('onFinishing');
              });
              ele.children('.steps-wrapper').on('finished', function() {
                return scope.$apply(function() {
                  if (tAttrs.finished != null) {
                    return scope.finished();
                      
                  }
                });
              });
              return ele.children('.steps-wrapper').on('stepChanging', function(e, index) {
                if (forms[index] && forms[index].name && !scope.$parent.$eval(forms[index].name + '.$valid')) {
                }
                return scope.$apply(function() {
                  if (tAttrs.stepChanging != null) {
                    return scope.stepChanging(ele.children('.steps-wrapper'));
                  }
                  return true;
                });
              });
            }
          };
        }
      };
  }])

});