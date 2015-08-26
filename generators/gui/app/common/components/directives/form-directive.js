"use strict";

define(['angular', 'jquery-steps'], function () {

    angular.module("app.form.directives", [])

.directive('uiWizardForm', [
  function() {
    return {
      scope: {
        stepChanging: '=',
        stepChanged: '=',
        finished: '&'
      },
      compile: function(tElement, tAttrs, transclude) {
        var steps;
        tElement.wrapInner('<div class="steps-wrapper">');
        steps = tElement.children('.steps-wrapper').steps({});
        return {
          pre: function(scope, ele, attrs) {},
          post: function(scope, ele, attrs) {
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
                console.log('finishing');
            });
            ele.children('.steps-wrapper').on('finished', function() {
                console.log('finished');
              return scope.$apply(function() {
                if (tAttrs.finished != null) {
                   // reset nas cores das abas
                  jQuery('.first disabled').addClass('current').removeClass('first disabled');
                  jQuery('.first done').addClass('current').removeClass('first done');
                  jQuery('.done').addClass('disabled').removeClass('done');
                  jQuery('.current').addClass('disabled').removeClass('done');
                  jQuery('.last disabled').addClass('disabled').removeClass('last disabled');
                  jQuery('.last current disabled').addClass('disabled').removeClass('last current disabled');
                  jQuery('.last current').addClass('disabled').removeClass('last current');
               
                    
                  // reset no conteúdo do container    
                  jQuery('#steps-uid-0-p-5').css('display', 'none');
                  jQuery('#steps-uid-0-p-0').css('display', 'block');
                    
                    
                  // reset nos botões    
                  jQuery('a[href$="previous"]').parent().addClass('disabled')    
                  jQuery('a[href$="next"]').parent().css('display', 'block');
                  jQuery('a[href$="next"]').parent().removeClass('disabled');
                  jQuery('a[href$="finish"]').parent().css('display', 'none');
                      
                  return scope.finished();
                }
              });
            });
            return ele.children('.steps-wrapper').on('stepChanging', function() {
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





