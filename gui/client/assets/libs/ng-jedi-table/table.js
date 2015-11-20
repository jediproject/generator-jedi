/*
 ng-jedi-table v0.0.1
 https://github.com/jediproject/ng-jedi-table
*/
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
    ColumnConfiguration = (function() {
        function ColumnConfiguration(bodyMarkup, headerMarkup, TableConfig) {
            this.attribute = bodyMarkup.attribute;
            this.title = bodyMarkup.title;
            this.sortable = bodyMarkup.sortable;
            this.width = bodyMarkup.width;
            this.initialSorting = bodyMarkup.initialSorting;
            if (headerMarkup) {
                this.customContent = headerMarkup.customContent;
                this.attributes = headerMarkup.attributes;
            }
            this.TableConfig = TableConfig;
        }

        ColumnConfiguration.prototype.createElement = function() {
            var th;
            th = angular.element(document.createElement("th"));

            if (this.TableConfig.i18nDirective) {
                return th.attr(this.TableConfig.i18nDirective, '');
            }

            return th;
        };

        ColumnConfiguration.prototype.renderTitle = function(element) {
            return element.html(this.customContent || this.title);
        };

        ColumnConfiguration.prototype.renderAttributes = function(element) {
            var attribute, _i, _len, _ref, _results;
            if (this.attributes) {
                _ref = this.attributes;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    attribute = _ref[_i];
                    _results.push(element.attr(attribute.name, attribute.value));
                }
                return _results;
            }
        };

        ColumnConfiguration.prototype.renderSorting = function(element) {
            var icon;
            if (this.sortable) {
                element.attr("ng-click", "sort('" + this.attribute + "')");
                icon = angular.element("<i style='margin-left: 10px;'></i>");
                icon.attr("ng-class", "getSortIcon('" + this.attribute + "')");
                return element.append(icon);
            }
        };

        ColumnConfiguration.prototype.renderWidth = function(element) {
            return element.attr("width", this.width);
        };

        ColumnConfiguration.prototype.renderHtml = function() {
            var th;
            th = this.createElement();
            this.renderTitle(th);
            this.renderAttributes(th);
            this.renderSorting(th);
            this.renderWidth(th);
            return th;
        };

        return ColumnConfiguration;

    })();

    ScopeConfigWrapper = (function() {
        function ScopeConfigWrapper(scope, jdTable, itemsPerPage, jdPagesToShow, $q, $rootScope, $filter, TableConfig) {
            if (angular.isDefined(itemsPerPage)) {
                if (itemsPerPage.trim() === '') {
                    itemsPerPage = TableConfig.defaultPageSize;
                } else {
                    itemsPerPage = parseInt(itemsPerPage);
                }
            }

            var $this = this;
            this.scope = scope;
            this.$q = $q;
            this.$filter = $filter;
            this.checkedItemsList = [];

            var tableData = scope.$parent.$eval(jdTable);
            scope.isMemory = false;
            if (typeof tableData === 'function') {
                tableData = {
                    changeEvent: tableData
                };
            } else if (_.isArray(tableData) || typeof tableData === 'undefined') {
                //Data in memory
                scope.isMemory = true;
                tableData = {};
            } else {
                if (tableData.checkedKey && tableData.checkedFilter) {
                    scope.hasCheck = true;
                    tableData = angular.extend(tableData, {
                        getCheckedItems: function() {
                            $this.saveCheckedItems();
                            return $this.checkedItemsList;
                        },
                        clearAllCheckedItems: function() {
                            $this.checkedItemsList = [];
                        }
                    });
                }
            }

            scope.jdConfig = this.jdConfig = angular.extend(tableData, {
                itemsPerPage: itemsPerPage,
                currentPage: 0,
                sortContext: 'global',
                orderBy: 'orderBy',
                listName: scope.isMemory ? jdTable : 'listData',
                sortList: [],
                predicates: [],
                numberOfPages: 1,
                numberOfPagesToShow: jdPagesToShow ? jdPagesToShow : 5,
                getLastPage: function() {
                    //If all pages are full it means that the next item will go on a new page.
                    if (scope.sortedAndPaginatedList.totalCount % itemsPerPage === 0) {
                        return this.numberOfPages + 1;
                    }

                    return this.numberOfPages;
                },
                setSortAndPredicates: function(sort, predicates) {
                    this.sortList = sort ? sort : [];
                    this.predicates = predicates ? predicates : [];
                },
                // If not in memory
                // Sort = none and currentPage = first.
                refresh: function() {
                    $this.checkedItemsList = [];
                    $this.callChangeEvent(0, $this.jdConfig.itemsPerPage, undefined, function(list) {
                        $this.setCurrentPage(0);
                        $this.jdConfig.setSortAndPredicates();
                        $this.setList(list);
                        $this.keepItemSelected();
                    });
                },
                refreshAndGoToLastPage: function() {
                    $this.callChangeEvent($this.jdConfig.numberOfPages - 1, $this.jdConfig.itemsPerPage, undefined, function(list) {
                        $this.setCurrentPage($this.jdConfig.numberOfPages - 1);
                        $this.jdConfig.setSortAndPredicates();
                        $this.setList(list);
                        $this.keepItemSelected();
                    });
                },
                refreshAndKeepCurrentPage: function() {
                    var predicates = $this.jdConfig.predicates;
                    var sortList = $this.jdConfig.sortList;
                    $this.callChangeEvent($this.jdConfig.currentPage, $this.jdConfig.itemsPerPage, $this.jdConfig.predicates, function(list) {
                        $this.setCurrentPage($this.jdConfig.currentPage);
                        $this.jdConfig.setSortAndPredicates(sortList, predicates);
                        $this.setList(list);
                        $this.keepItemSelected();
                    });
                },
                hasData: function() {
                    return $this.getList() ? $this.getList().length > 0 : false;
                },
                clearData: function() {
                    var list = [];
                    list.totalCount = 0;
                    scope.$eval($this.jdConfig.listName + '=value', {
                        value: list
                    });
                },
                clearTable: function() {
                    scope.$eval($this.jdConfig.listName + '=value', {
                        value: null
                    });
                },
                getList: function() {
                    return $this.getList() ? $this.getList().slice(0) : undefined;
                },
                checkAllItems: function(param) {
                    var currentPage = $this.getList();
                    angular.forEach(currentPage, function(obj) {
                        $this.jdConfig.checkItem(obj, param);
                    });
                },
                prepareData: tableData.prepareData ? tableData.prepareData : function(data) {
                    var extractedData = data;
                    if (!_.isArray(data) && data.pageItems && data.pageNo && data.totalCount >= 0) {
                        extractedData = [];
                        extractedData = data.pageItems;
                        extractedData.totalCount = data.totalCount;
                        extractedData.pageNo = data.pageNo;
                    }
                    return extractedData;
                }
            });

            //If API paginated, jdConfig data is passed to controller's jdTable variable.
            if (!scope.isMemory) {
                scope.$parent.$eval(jdTable + '=value', {
                    value: this.jdConfig
                });
            }
        }

        ScopeConfigWrapper.prototype.getList = function() {
            return this.scope.$eval(this.jdConfig.listName);
        };

        ScopeConfigWrapper.prototype.getTotalCount = function() {
            var list = this.getList();
            if (list) {
                if (this.jdConfig.changeEvent) {
                    return list.totalCount;
                } else {
                    return list.length;
                }
            } else {
                return undefined;
            }
        };

        ScopeConfigWrapper.prototype.setList = function(_list) {
            this.scope.$eval(this.jdConfig.listName + '=list', {
                list: _list
            });
        };

        ScopeConfigWrapper.prototype.getSortList = function() {
            return this.jdConfig.sortList;
        };

        ScopeConfigWrapper.prototype.setSortList = function(sortList) {
            return this.jdConfig.sortList = sortList; // jshint ignore:line
        };

        ScopeConfigWrapper.prototype.setPredicates = function(predicates) {
            return this.jdConfig.predicates = predicates; // jshint ignore:line
        };

        ScopeConfigWrapper.prototype.getPredicates = function() {
            return this.jdConfig.predicates;
        };

        ScopeConfigWrapper.prototype.callChangeEvent = function(page, itemsPerPage, sortList, success) {
            var $this = this;
            var deferred = this.$q.defer();
            deferred.promise.then(function(list) {
                // atribui página atual para atribuir ao scope
                // sempre que lista for atualizada por evento de paginação ou ordenação o update será chamado,
                // caso o objeto tenha o atributo pageNo esta página será atribuída ao currentPage, caso contrário será considerado como página 0,
                // para filtros pela tela resete a páginação/ordenação, pois não é executado por um promise, a atribuição é direto no list, não pasando por aqui.

                var extractedData = $this.jdConfig.prepareData(list);

                if (extractedData && !extractedData.pageNo) {
                    extractedData.pageNo = page + 1;
                }

                success(extractedData);
            });

            this.jdConfig.changeEvent({
                pageNo: page + 1,
                pageSize: itemsPerPage,
                sort: sortList
            }, deferred);
        };

        ScopeConfigWrapper.prototype.getItemsPerPage = function() {
            return this.jdConfig.itemsPerPage;
        };

        ScopeConfigWrapper.prototype.getCurrentPage = function() {
            return this.jdConfig.currentPage;
        };

        ScopeConfigWrapper.prototype.getSortContext = function() {
            return this.jdConfig.sortContext;
        };

        ScopeConfigWrapper.prototype.setCurrentPage = function(currentPage) {
            return this.jdConfig.currentPage = currentPage; // jshint ignore:line
        };

        ScopeConfigWrapper.prototype.getOrderBy = function() {
            return this.jdConfig.orderBy;
        };

        ScopeConfigWrapper.prototype.getOrderBy = function() {
            return this.jdConfig.orderBy;
        };

        ScopeConfigWrapper.prototype.getNumberOfPages = function() {
            return this.jdConfig.numberOfPages;
        };

        ScopeConfigWrapper.prototype.setNumberOfPages = function(numberOfPages) {
            return this.jdConfig.numberOfPages = numberOfPages; // jshint ignore:line 
        };

        ScopeConfigWrapper.prototype.getNumberOfPagesToShow = function() {
            return this.jdConfig.numberOfPagesToShow;
        };

        ScopeConfigWrapper.prototype.keepItemSelected = function() {
            var selectedItem = this.jdConfig ? this.jdConfig.selectedItem : undefined;
            if (selectedItem) {
                angular.forEach(this.getList(), function(item) {
                    //ToDo: Alterar condição para comparar todos os atributos do selectedItem.
                    if (item.id && selectedItem.id && item.id == selectedItem.id) { // jshint ignore:line
                        selectedItem = item;
                    }
                });
                this.jdConfig.selectedItem = selectedItem;
            }
        };

        ScopeConfigWrapper.prototype.saveCheckedItems = function() {
            var $this = this;
            var currentPage = this.getList();
            var filter = this.jdConfig.checkedFilter();
            var key = this.jdConfig.checkedKey();

            angular.forEach(currentPage, function(pageItem) {
                var checkedItemIndex = _.findIndex($this.checkedItemsList, function isInCheckedList(checkedItem) {
                    return checkedItem[key] === pageItem[key];
                });
                if (checkedItemIndex !== -1) {
                    $this.checkedItemsList.splice(checkedItemIndex, 1);
                }
            });

            var checkedItems = this.$filter('filter')(currentPage, filter);

            $this.checkedItemsList = _.union($this.checkedItemsList, checkedItems);
        };

        ScopeConfigWrapper.prototype.applyCheckedItems = function() {
            var $this = this;
            var currentPage = this.getList();
            var key = this.jdConfig.checkedKey();

            angular.forEach(currentPage, function(pageItem) {
                var checkedItem = _.find($this.checkedItemsList, function isInCheckedList(checkedItem) {
                    return checkedItem[key] === pageItem[key];
                });
                if (checkedItem !== undefined) {
                    delete checkedItem.$$hashKey;
                    var checkedProperties = Object.getOwnPropertyNames(checkedItem);
                    var pageItemProperties = Object.getOwnPropertyNames(pageItem);

                    //Returns all the properties that the checkedItem has and the pageItem hasn't.
                    var differences = _.difference(checkedProperties, pageItemProperties);

                    angular.forEach(differences, function(diff) {
                        pageItem[diff] = checkedItem[diff];
                    });
                }
            });
        };

        return ScopeConfigWrapper;

    })();

    TableConfiguration = (function() {
        function TableConfiguration(tableElement, attributes, TableConfig) {
            this.tableElement = tableElement;
            this.attributes = attributes;
            this.id = this.attributes.id;
            this.paginated = this.attributes.jdPaginated != null; // jshint ignore:line
            this.list = this.attributes.jdTable;
            this.atChange = this.attributes.atChange;
            this.TableConfig = TableConfig;
            this.createColumnConfigurations();
        }

        TableConfiguration.prototype.capitaliseFirstLetter = function(string) {
            if (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            } else {
                return "";
            }
        };

        TableConfiguration.prototype.extractWidth = function(prop) {
            var width;
            width = /([0-9]+px)/i.exec(prop);
            if (width) {
                return width[0];
            } else {
                return "";
            }
        };

        TableConfiguration.prototype.isSortable = function(classes) {
            var sortable;
            sortable = /(sortable)/i.exec(classes);
            if (sortable) {
                return true;
            } else {
                return false;
            }
        };

        TableConfiguration.prototype.getInitialSorting = function(td) {
            var initialSorting;
            initialSorting = td.attr("jd-initial-sorting");
            if (initialSorting) {
                if (initialSorting === "asc" || initialSorting === "desc") {
                    return initialSorting;
                }
                throw "Invalid value for initial-sorting: " + initialSorting + ". Allowed values are 'asc' or 'desc'.";
            }
            return void 0;
        };

        TableConfiguration.prototype.collectHeaderMarkup = function(table) {
            var customHeaderMarkups, th, tr, thead, _i, _len, _ref;
            customHeaderMarkups = {};
            tr = table.find("tr");
            thead = table.find("thead");
            _ref = tr.find("th");
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                th = _ref[_i];
                th = angular.element(th);
                customHeaderMarkups[th.attr("jd-attribute")] = {
                    customContent: th.html(),
                    attributes: th[0].attributes
                };

                if (!thead.is('[jd-ignore-header]')) {
                    th.remove();
                }
            }
            return customHeaderMarkups;
        };

        TableConfiguration.prototype.collectBodyMarkup = function(table) {
            var attribute, bodyDefinition, initialSorting, sortable, td, title, width, _i, _len, _ref;
            bodyDefinition = [];
            _ref = table.find("td");
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                td = _ref[_i];
                td = angular.element(td);
                if (table.attr('jd-ellipsis') !== "false") {
                    td.addClass('text-ellipsis');
                }
                attribute = td.attr("jd-attribute");
                title = td.attr("jd-title") || this.capitaliseFirstLetter(td.attr("jd-attribute"));
                sortable = td.attr("jd-sortable") !== void 0 || this.isSortable(td.attr("class"));
                width = this.extractWidth(td.attr("width") ? td.attr("width") : td.attr("class"));
                initialSorting = this.getInitialSorting(td);
                bodyDefinition.push({
                    attribute: attribute,
                    title: title,
                    sortable: sortable,
                    width: width,
                    initialSorting: initialSorting
                });
            }
            return bodyDefinition;
        };

        TableConfiguration.prototype.createColumnConfigurations = function() {
            var bodyMarkup, headerMarkup, i, _i, _len;
            headerMarkup = this.collectHeaderMarkup(this.tableElement);
            bodyMarkup = this.collectBodyMarkup(this.tableElement);
            this.columnConfigurations = [];
            for (_i = 0, _len = bodyMarkup.length; _i < _len; _i++) {
                i = bodyMarkup[_i];
                this.columnConfigurations.push(new ColumnConfiguration(i, headerMarkup[i.attribute], this.TableConfig));
            }
        };

        return TableConfiguration;

    })();

    Setup = (function() {
        function Setup() {}

        Setup.prototype.setupTr = function(element, repeatString) {
            var tbody, tr;
            tbody = element.find("tbody");
            tr = tbody.find("tr");
            tr.attr("ng-repeat", repeatString);
            return tbody;
        };
        return Setup;
    })();

    PaginatedSetup = (function(_super) {
        __extends(PaginatedSetup, _super);

        function PaginatedSetup() {} // jshint ignore:line

        PaginatedSetup.prototype.compile = function(element) {
            var trackBy = element.attr('track-by') || '';
            if (trackBy && trackBy.trim() !== '') {
                if (trackBy.trim().indexOf('$') < 0 && trackBy.trim().indexOf('item.') < 0) {
                    trackBy = 'item.' + trackBy;
                }
                this.setupTr(element, "item in sortedAndPaginatedList track by " + trackBy);
            } else {
                this.setupTr(element, "item in sortedAndPaginatedList");
            }
        };

        PaginatedSetup.prototype.link = function($scope, $element, $attributes, $filter, $q, $rootScope, TableConfig) {

            var getSortedAndPaginatedList, update, w, keepInBounds, updateCheckAll;
            var allCheckedStatus = false;

            w = new ScopeConfigWrapper($scope, $attributes.jdTable, $attributes.jdPaginated, $attributes.jdPagesToShow, $q, $rootScope, $filter, TableConfig);

            getSortedAndPaginatedList = function(list, currentPage, itemsPerPage, orderBy, sortContext, predicate, $filter) {
                var fromPage, val;
                if (list) {
                    val = list;

                    if (itemsPerPage) {
                        fromPage = itemsPerPage * currentPage - list.length;
                    }
                    if (sortContext === "global") {
                        if (predicate.length > 0) {
                            val = $filter(orderBy)(val, predicate);
                        }
                        if (itemsPerPage) {
                            val = $filter("limitTo")(val, fromPage);
                            val = $filter("limitTo")(val, itemsPerPage);
                        }
                    } else {
                        if (itemsPerPage) {
                            val = $filter("limitTo")(val, fromPage);
                            val = $filter("limitTo")(val, itemsPerPage);
                        }
                        if (predicate.length > 0) {
                            val = $filter(orderBy)(val, predicate);
                        }
                    }
                    return val;
                } else {
                    return [];
                }
            };

            // inicio paginação
            keepInBounds = function(val, min, max) {
                val = Math.max(min, val);
                return Math.min(max, val);
            };
            // fim paginação

            update = function() {
                if (w.getList()) {
                    // trecho que prepara a lista filtrada e ordenada
                    if ($scope.jdConfig.changeEvent) {
                        // {length: 13, list: [object, object, object...]}
                        $scope.sortedAndPaginatedList = w.getList(); // lista de json paginado
                    } else {
                        $scope.sortedAndPaginatedList = getSortedAndPaginatedList(w.getList(), w.getCurrentPage(), w.getItemsPerPage(), w.getOrderBy(), w.getSortContext(), w.getPredicates(), $filter);
                    }
                } else {
                    $scope.sortedAndPaginatedList = null;
                }

                // inicio paginação
                if (w.getItemsPerPage()) {
                    var newNumberOfPages, numberOfPagesToShow, totalCount;
                    totalCount = w.getTotalCount();
                    var currentPage;
                    if (totalCount > 0) {
                        newNumberOfPages = Math.ceil(totalCount / w.getItemsPerPage());
                        numberOfPagesToShow = newNumberOfPages >= w.getNumberOfPagesToShow() ? w.getNumberOfPagesToShow() : newNumberOfPages;
                        w.setNumberOfPages(newNumberOfPages);
                        $scope.pageSequence.resetParameters(0, newNumberOfPages, numberOfPagesToShow);
                        w.setCurrentPage(keepInBounds(w.getCurrentPage(), 0, w.getNumberOfPages() - 1));
                        currentPage = w.getCurrentPage();
                    } else {
                        w.setNumberOfPages(1);
                        $scope.pageSequence.resetParameters(0, 1, 1);
                        w.setCurrentPage(0);
                        currentPage = 0;
                    }

                    updateCheckAll();
                    $rootScope.$broadcast('Jedi-Table.TableUpdated', w.jdConfig);
                    return $scope.pageSequence.realignGreedy(currentPage);
                }

                updateCheckAll();
                $rootScope.$broadcast('Jedi-Table.TableUpdated', w.jdConfig);
            };

            updateCheckAll = function() {
                if ($scope.hasCheck && typeof w.jdConfig.onAllChecked === 'function') {
                    var currentPage = w.getList();
                    if (!currentPage || currentPage.length === 0) {
                        if (allCheckedStatus) {
                            w.jdConfig.onAllChecked(false);
                            allCheckedStatus = false;
                        }
                    } else {
                        var checkedItems = $filter('filter')(currentPage, w.jdConfig.checkedFilter());

                        // nextStatus => true when all items in the page are checked; false if at least one item is not;
                        var nextStatus = (checkedItems.length === currentPage.length && checkedItems.length !== 0);

                        if (nextStatus !== allCheckedStatus) {
                            w.jdConfig.onAllChecked(nextStatus);
                            allCheckedStatus = nextStatus;
                        }
                    }
                }
            };

            $scope.isInitialized = function() {
                return !angular.isUndefined(w.getList()) && !angular.isUndefined(w.getTotalCount());
            };
            $scope.isEmpty = function() {
                return $scope.isInitialized() && w.getTotalCount() < 1;
            };
            $scope.getNumberOfPages = function() {
                return w.getNumberOfPages();
            };
            $scope.getCurrentPage = function() {
                return w.getCurrentPage();
            };

            // inicio eventos
            $scope.sort = function(predicate) {
                if (!w.getSortList()) {
                    return;
                }

                var _sortList = [];
                _sortList = _sortList.concat(w.getSortList());

                var result = _.find(_sortList, function(e) {
                    return e.predicate === predicate;
                });

                if (!result) {
                    _sortList.push({
                        predicate: predicate,
                        descending: true
                    });
                } else {
                    if (!result.descending) {
                        var indexObj = _sortList.indexOf(result);
                        _sortList.splice(indexObj, 1);
                    } else {
                        result.descending = false;
                    }
                }

                var _predicates = [];
                angular.forEach(_sortList, function(item) {
                    if (item.descending) {
                        _predicates.push('-' + item.predicate); //Descresente
                    } else {
                        _predicates.push(item.predicate); //Crescente
                    }
                });

                if ($scope.jdConfig.changeEvent) {
                    if (w.getCurrentPage() !== 0) {
                        w.setCurrentPage(0);
                    }

                    if ($scope.hasCheck) {
                        w.saveCheckedItems();
                    }

                    w.callChangeEvent(w.getCurrentPage(), w.getItemsPerPage(), _predicates, function(list) {
                        w.setSortList(_sortList);
                        w.setPredicates(_predicates);
                        w.setList(list);
                        w.keepItemSelected();

                        if ($scope.hasCheck) {
                            w.applyCheckedItems();
                        }
                    });
                } else {
                    w.setSortList(_sortList);
                    w.setPredicates(_predicates);

                    if (w.getCurrentPage() !== 0) {
                        w.setCurrentPage(0);
                    } else {
                        update();
                    }
                }
            };

            $scope.stepPage = function(page) {
                page = parseInt(page);
                page = keepInBounds(w.getCurrentPage() + page, 0, w.getNumberOfPages() - 1);
                if ($scope.jdConfig.changeEvent) {
                    if ($scope.hasCheck) {
                        w.saveCheckedItems();
                    }
                    w.callChangeEvent(page, w.getItemsPerPage(), w.getPredicates(), function(list) {
                        $scope.pageSequence.realignGreedy(page);
                        w.setCurrentPage(page);
                        w.setList(list);
                        w.keepItemSelected();

                        if ($scope.hasCheck) {
                            w.applyCheckedItems();
                        }
                    });
                } else {
                    $scope.pageSequence.realignGreedy(page);
                    w.setCurrentPage(page);
                }
            };

            $scope.firstPage = function() {
                return $scope.stepPage(-1);
            };

            $scope.goToPage = function(page) {
                if ($scope.jdConfig.changeEvent) {
                    if ($scope.hasCheck) {
                        w.saveCheckedItems();
                    }
                    w.callChangeEvent(page, w.getItemsPerPage(), w.getPredicates(), function(list) {
                        w.setCurrentPage(page);
                        w.setList(list);
                        w.keepItemSelected();

                        if ($scope.hasCheck) {
                            w.applyCheckedItems();
                        }
                    });
                } else {
                    return w.setCurrentPage(page);
                }
            };
            // fim eventos

            $scope.pageSequence = new PageSequence();

            if (!$scope.jdConfig.changeEvent) {
                $scope.$watch('jdConfig.currentPage', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        return update();
                    }
                });
            }

            $scope.$watch('jdConfig.itemsPerPage', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    if ($scope.jdConfig.changeEvent) {
                        w.callChangeEvent(w.getCurrentPage(), newValue, w.getPredicates(), function(list) {
                            w.setItemsPerPage(newValue);
                            w.setList(list);
                            w.keepItemSelected();
                        });
                    } else {
                        return update();
                    }
                }
            });

            if (!$scope.jdConfig.changeEvent) {
                $scope.$watch('jdConfig.sortContext', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        return update();
                    }
                });
            }

            // If data is in memory, listen to the changes and update the table.
            if ($scope.isMemory) {
                $scope.$watchCollection($attributes.jdTable, function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        update();
                    }
                });

                // The watchCollection and the watch are necessary to distinguish between the elements of the 
                // table changing completely (as in reloading the table, or changing page) from smaller changes (e.g.: an item being checked)
                // The first will easily fall on the watchCollection, and the second below. In the second case we don't want to 
                // trigger the update function, but you may need the event broadcasted
                $scope.$watch($attributes.jdTable, function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        $rootScope.$broadcast('Jedi-Table.ListChanged', w.jdConfig);
                    }
                }, true);
            }

            if (!$scope.isMemory) {
                $scope.$watch('listData', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        update();
                    }
                }, true);

                // If attr 'jd-load-on-startup' or jdConfig.loadOnStartup are defined
                // Invoke changeEvent func to load first page
                if ($scope.jdConfig.loadOnStartup || angular.isDefined($attributes.jdLoadOnStartup)) {
                    setTimeout(function() {
                        w.callChangeEvent(0, w.getItemsPerPage(), undefined, function(list) {
                            w.setList(list);
                            w.keepItemSelected();
                        });
                    }, 1);
                }
            }

            update();
        };

        return PaginatedSetup;

    })(Setup);

    Table = (function() {
        function Table(element, tableConfiguration, TableConfig) {
            this.element = element;
            this.tableConfiguration = tableConfiguration;
            this.TableConfig = TableConfig;
        }

        Table.prototype.constructHeader = function() {
            var i, tr, _i, _len, _ref;
            tr = this.element.find("thead > tr");
            if (tr.length === 0) {
                tr = angular.element(document.createElement("tr"));
            }
            _ref = this.tableConfiguration.columnConfigurations;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                i = _ref[_i];
                tr.append(i.renderHtml());
            }
            return tr;
        };

        Table.prototype.setupHeader = function() {
            var header, thead;
            thead = this.element.find("thead");
            if (thead.length === 0) {
                thead = $('<thead></thead>');
                this.element.prepend(thead);
            }

            if (!thead.is('[jd-ignore-header]')) {
                header = this.constructHeader();
            }

            if (!this.element.hasClass('table')) {
                this.element.addClass("table table-bordered table-striped table-responsive table-hover");
            }

            return thead.append(header);
        };

        Table.prototype.setupFooter = function() {
            var tfoot = this.element.find('tfoot');
            if (tfoot.length === 0) {
                tfoot = $('<tfoot></tfoot>');
                this.element.append(tfoot);
            }

            var emptyTableTemp;

            if (this.TableConfig.emptyTableTemplate) {
                emptyTableTemp = this.TableConfig.emptyTableTemplate;
            } else {
                emptyTableTemp = emptyTableDefaultTemplate;
            }

            // In case there is a special i18n directive to use, we replace the default(i18n).
            if (this.TableConfig.i18nDirective) {
                emptyTableTemp = emptyTableTemp.replace(/i18n/g, this.TableConfig.i18nDirective);
            }

            // TODO Viana: ver como apresentar mensagem apenas após ajax de load for executado e permanecer sem registros
            // avaliar uso do promise
            tfoot.append(emptyTableTemp);

            if (this.tableConfiguration.paginated) {
                //Se o attr jdScroll for false, não deve ser adicionado o scroll, logo a paginação fica normal.
                if (this.element.attr("jd-scroll") === "false") {
                    tfoot.append(paginationTemplate);
                } else {
                    var pagination = angular.element(paginationTemplateScroll);
                    pagination.addClass('scrolled-pagination');
                    tfoot.append(pagination);
                }
            }
        };

        Table.prototype.getSetup = function() {
            return new PaginatedSetup();
        };

        Table.prototype.compile = function() {
            this.setupHeader();
            this.setupFooter();
            this.setup = this.getSetup();
            return this.setup.compile(this.element);
        };

        Table.prototype.setupInitialSorting = function($scope) {
            var bd, _i, _len, _ref, _results;
            _ref = this.tableConfiguration.columnConfigurations;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                bd = _ref[_i];
                if (bd.initialSorting) {
                    if (!bd.attribute) {
                        throw "initial-sorting specified without attribute.";
                    }
                    _results.push($scope.descending = bd.initialSorting === "desc");
                    $scope.sort(bd.attribute);
                } else {
                    _results.push(void 0);
                }
            }
            return _results;
        };

        Table.prototype.post = function($scope, $element, $attributes, $filter, $q, $rootScope, TableConfig) {
            if (!$scope.getSortIcon) {
                $scope.getSortIcon = function(predicate) {
                    var result;
                    if ($scope.jdConfig.sortList && $scope.jdConfig.sortList.length > 0) {
                        result = _.find($scope.jdConfig.sortList, function(e) {
                            return e.predicate === predicate;
                        });
                    }

                    if (!result) {
                        return "glyphicon glyphicon-minus";
                    } else
                    if (result.descending) {
                        return "glyphicon glyphicon-chevron-down";
                    } else {
                        return "glyphicon glyphicon-chevron-up";
                    }
                };
            }

            var ret = this.setup.link($scope, $element, $attributes, $filter, $q, $rootScope, TableConfig);

            // configura ordenação inicial, caso haja
            this.setupInitialSorting($scope);

            return ret;
        };

        return Table;

    })();

    PageSequence = (function() {
        function PageSequence(lowerBound, upperBound, start, length) {
            this.lowerBound = lowerBound != null ? lowerBound : 0; // jshint ignore:line
            this.upperBound = upperBound != null ? upperBound : 1; // jshint ignore:line
            if (start == null) { // jshint ignore:line
                start = 0;
            }
            this.length = length != null ? length : 1; // jshint ignore:line
            if (this.length > (this.upperBound - this.lowerBound)) {
                throw "sequence is too long";
            }
            this.data = this.generate(start);
        }

        PageSequence.prototype.generate = function(start) {
            var x, _i, _ref, _results;
            if (start > (this.upperBound - this.length)) {
                start = this.upperBound - this.length;
            } else if (start < this.lowerBound) {
                start = this.lowerBound;
            }
            _results = [];
            for (x = _i = start, _ref = parseInt(start) + parseInt(this.length) - 1; start <= _ref ? _i <= _ref : _i >= _ref; x = start <= _ref ? ++_i : --_i) {
                _results.push(x);
            }
            return _results;
        };

        PageSequence.prototype.resetParameters = function(lowerBound, upperBound, length) {
            this.lowerBound = lowerBound;
            this.upperBound = upperBound;
            this.length = length;
            if (this.length > (this.upperBound - this.lowerBound)) {
                throw "sequence is too long";
            }
            return this.data = this.generate(this.data[0]); // jshint ignore:line
        };

        PageSequence.prototype.relocate = function(distance) {
            var newStart;
            newStart = this.data[0] + distance;
            return this.data = this.generate(newStart, newStart + this.length); // jshint ignore:line
        };

        PageSequence.prototype.realignGreedy = function(page) {
            var newStart;

            //Se a página que está sendo navegada não existe na lista de páginas exibidas, atualizo as páginas a serem exibidas.
            if (this.data.indexOf(page) === -1) {
                newStart = page;
                return this.data = this.generate(newStart); // jshint ignore:line
            }
        };

        PageSequence.prototype.realignGenerous = function(page) {};

        return PageSequence;

    })();
    angular.module("jedi.table").directive("jdTable", ["$filter", '$q', '$rootScope', '$compile', 'jedi.table.TableConfig', function($filter, $q, $rootScope, $compile, TableConfig) {
        return {
            restrict: "AC",
            scope: true,
            compile: function(element, attributes) {
                var table, tc;

                var trElement = angular.element(element.find('tbody').find('tr'));

                if ('ng-click' in trElement[0].attributes) {
                    trElement[0].attributes['ng-click'].value = trElement[0].attributes['ng-click'].value.concat('; markSelected(item)');
                } else {
                    trElement.attr('ng-click', 'markSelected(item)');
                }

                trElement.attr('ng-class', "{'table-selected-row' : item == jdConfig.selectedItem}");

                tc = new TableConfiguration(element, attributes, TableConfig);
                table = new Table(element, tc, TableConfig);
                table.compile();
                return {
                    post: function($scope, $element, $attributes) {
                        table.post($scope, $element, $attributes, $filter, $q, $rootScope, TableConfig);

                        $scope.markSelected = function(item) {
                            if (this.jdConfig.selectedItem !== item) {
                                this.jdConfig.selectedItem = item;
                                return;
                            }

                            this.jdConfig.selectedItem = undefined;
                        };

                        if ($attributes.jdScroll !== "false") {
                            var scroll = angular.element('<div class="table-scroll"></div>');
                            $element.before(scroll);
                            scroll.append($element);
                            var pagination = $element.find('.scrolled-pagination');
                            pagination.insertAfter(scroll).addClass('text-center');

                            var destroy = function destroy() {
                                var s = scroll;
                                var p = pagination;
                                scroll = null;
                                pagination = null;

                                if (s) {
                                    s.remove();
                                }

                                if (p) {
                                    p.remove();
                                }
                            };

                            //// destroy
                            //// se escopo destruido remove elementos
                            $scope.$on('$destroy', function() {
                                destroy();
                            });

                            //// se a table for destruida remove demais elementos
                            $element.on('$destroy', function() {
                                destroy();
                            });
                        }
                    }
                };
            }
        };
    }]);

    angular.module("jedi.table").directive("jdAttribute", [function() {
        return {
            restrict: "A",
            compile: function(element, attributes) {
                var attribute;
                attribute = element.attr("jd-attribute");
                if (!attribute) {
                    throw "jd-attribute specified without value: " + (element.html());
                }
                if (element.children().length === 0) {
                    if (attributes.jdFilter) {
                        return element.append("{{item." + attribute + " | " + attributes.jdFilter + "}}");
                    } else {
                        return element.append("{{item." + attribute + "}}");
                    }
                }
            }
        };
    }]);
}));