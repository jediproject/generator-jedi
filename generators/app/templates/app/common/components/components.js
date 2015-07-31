'use strict';

define([<% if (props.useI18n) {%>'ng-jedi-i18n',
        <%}%>'ng-jedi-dialogs',
        'ng-jedi-factory',
        'ng-jedi-loading',
        <% if (props.useBreadcrumb) {%>'ng-jedi-breadcrumb',
        <%}%>'ng-jedi-layout',
        'app-common-components-exceptions'], function () {

    angular.module('app.common.components', [<% if (props.useI18n) {%>'jedi.i18n',
                                             <%}%>'jedi.dialogs',
                                             'jedi.factory',
                                             'jedi.loading',
                                             <% if (props.useBreadcrumb) {%>'jedi.breadcrumb',
                                             <%}%>'jedi.layout',
                                             'app.common.components.exceptions']);

});