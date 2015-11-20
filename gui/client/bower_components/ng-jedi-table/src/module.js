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