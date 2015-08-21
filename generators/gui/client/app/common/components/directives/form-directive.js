"use strict";

define(['angular', 'jquery-steps'], function () {

    angular.module("app.form.directives", [])

    .directive("uiWizardForm", ['$compile', function ($compile) {
        return {
            compile: function (ele) {
                ele.wrapInner('<div class="steps-wrapper">');
                var steps = ele.children('.steps-wrapper').steps();
                //$compile(steps)(scope);

            }
        }
        }])

});



//app.directive('uiWizardForm', [ ->
//    return {
//        scope: {
//            stepChanging: '=',
//            stepChanged: '=',
//            finished: '&'
//        },
//        compile: (tElement, tAttrs, transclude) ->
//          tElement.wrapInner('<div class="steps-wrapper">')
//          steps = tElement.children('.steps-wrapper').steps({
//          })
//
//          return {
//            pre: (scope, ele, attrs) ->
//
//            post: (scope, ele, attrs) ->
//              # Post-link function
//
//              ele.closest('form').validate();
//
//              ele.children('.steps-wrapper').on 'stepChanged', ->
//                scope.$apply ->
//                  scope.stepChanged(ele.children('.steps-wrapper')) if tAttrs.stepChanged?
//
//              ele.children('.steps-wrapper').on 'finished', ->
//                scope.$apply ->
//                  scope.finished() if tAttrs.finished?
//
//              ele.children('.steps-wrapper').on 'stepChanging', ->
//                scope.$apply ->
//                  return scope.stepChanging(ele.children('.steps-wrapper')) if tAttrs.stepChanging?
//                  true
//
//          }
//    }
//])