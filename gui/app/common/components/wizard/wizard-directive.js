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
              /*
              ele.find('a[href$="previous"]').parent().addClass('disabled')    
              ele.find('a[href$="next"]').parent().css('display', 'block');
              ele.find('a[href$="next"]').parent().removeClass('disabled');
              ele.find('a[href$="finish"]').parent().css('display', 'none');
              */
              ele.children('.steps-wrapper').on('finished', function() {
                return scope.$apply(function() {
                  if (tAttrs.finished != null) {
                    // reset nas cores das abas
                    ele.find('.first disabled').addClass('current').removeClass('first disabled');
                    ele.find('.first done').addClass('current').removeClass('first done');
                    ele.find('.done').addClass('disabled').removeClass('done');
                    ele.find('.current').addClass('disabled').removeClass('done');
                    ele.find('.last disabled').addClass('disabled').removeClass('last disabled');
                    ele.find('.last current disabled').addClass('disabled').removeClass('last current disabled');
                    ele.find('.last current').addClass('disabled').removeClass('last current');

                    // reset no conteúdo do container    
                    ele.find('#steps-uid-0-p-5').css('display', 'none');
                    ele.find('#steps-uid-0-p-0').css('display', 'block');

                    // reset nos botões    
                    ele.find('a[href$="previous"]').parent().addClass('disabled')    
                    ele.find('a[href$="next"]').parent().css('display', 'block');
                    ele.find('a[href$="next"]').parent().removeClass('disabled');
                    ele.find('a[href$="finish"]').parent().css('display', 'none');

                    return scope.finished();
                  }
                });
              });
              return ele.children('.steps-wrapper').on('stepChanging', function(e, index) {
                if (forms[index] && forms[index].name && !scope.$parent.$eval(forms[index].name + '.$valid')) {
                  //return false;
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