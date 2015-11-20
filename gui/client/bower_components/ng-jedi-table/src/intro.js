(function (factory) {
    if (typeof define === 'function') {
        define(['angular'], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.table';
        }
        return factory();
    }
}(function() {
    var ColumnConfiguration, PageSequence, PaginatedSetup, ScopeConfigWrapper, Setup, Table, TableConfiguration, emptyTableDefaultTemplate, paginationTemplate, paginationTemplateScroll,
        __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    emptyTableDefaultTemplate = '<tr ng-show="isEmpty()"><td colspan="100%"><strong class="text-warning"><i18n>No item found.</i18n></strong></td></tr>';
    paginationTemplateScroll = "<div ng-show='isInitialized() && !isEmpty() && getNumberOfPages() > 1' style='margin: 0px;margin-top:10px;'><ul class='pagination'><li ng-class='{disabled: getCurrentPage() <= 0}'><a href='' ng-click='firstPage()'>&lsaquo;</a></li><li ng-if='pageSequence.data[0] > 0'><a href='' ng-click='stepPage(-jdConfig.numberOfPages)'>1</a></li><li ng-if='pageSequence.data[0] > 0'><a href='' ng-click='stepPage(-(pageSequence.data.indexOf(getCurrentPage()) + jdConfig.numberOfPagesToShow))'>&hellip;</a></li><li ng-class='{active: getCurrentPage() == page}' ng-repeat='page in pageSequence.data'><a href='' ng-click='goToPage(page)'>{{page + 1}}</a></li><li ng-if='pageSequence.data[pageSequence.data.length -1] < getNumberOfPages() - 1'><a href='' ng-click='stepPage(jdConfig.numberOfPagesToShow - pageSequence.data.indexOf(getCurrentPage()))'>&hellip;</a></li><li ng-if='pageSequence.data[pageSequence.data.length -1] < getNumberOfPages() - 1'><a href='' ng-click='stepPage(getNumberOfPages())'>{{getNumberOfPages()}}</a></li><li ng-class='{disabled: getCurrentPage() >= getNumberOfPages() - 1}'><a href='' ng-click='stepPage(1)'>&rsaquo;</a></li></ul></div>";
    paginationTemplate = "<tr ng-show='isInitialized() && !isEmpty() && getNumberOfPages() > 1' class='jd-pagination'><td colspan='100%'>" + paginationTemplateScroll + "</td></tr>";

    angular.module("jedi.table", []).constant('jedi.table.TableConfig', {
        i18nDirective: '',
        defaultPageSize: 10,
        emptyTableTemplate: ''
    });