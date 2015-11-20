
    angular.module('jedi.layout.treeview', []).constant('jedi.layout.treeview.TreeviewConfig', {
        emptyTpl: '<div id="emptyTreeElement"><strong class="text-warning" jd-i18n>{{emptyMsgLabel}}</strong></div>',
        nodeTpl: '<li ng-repeat="{{repeatExp}}"><a class="angular-ui-tree-handle angular-ui-tree-hover" ng-click="toggle($event)" onclick="$(this).next().toggle();" href="javascript:;"><span class="fa fa-minus-square"></span>&nbsp;<strong>{{label}}</strong></a><ol class="angular-ui-tree-nodes"></ol></li>',
        lastNodeTpl: '<li class="angular-ui-tree-hover" ng-repeat="{{repeatExp}}" ng-class="{\'selected\' : {{rowItem}} == selectedItem}" ng-click="changeClass({{rowItem}})"></li>',
        emptyMsgLabel: 'No items found.'
    }).directive('jdTreeview', ['jedi.layout.treeview.TreeviewConfig', '$interpolate', function (TreeviewConfig, $interpolate) {
        return {
            restrict: 'A',
            compile: function (element, attributes) {
				if (!element.hasClass('angular-ui-tree-nodes')) {
					element.addClass('angular-ui-tree-nodes');
				}

                element.children().addClass('angular-ui-tree-child');

                var children = element.children();

                var list = attributes.jdTreeview.split(';');
                var parent = element;

                parent.addClass('pre-scrollable');

                angular.forEach(list, function (item) {
                    var labelField = item.match(/\[.*\]/g);
                    if (labelField && labelField.length > 0) {
                        labelField = labelField[0];
                        item = item.replace(labelField, '');
                        labelField = labelField.replace('[', '').replace(']', '');
                    } else {
                        labelField = undefined;
                    }

                    var child;
                    var rowItem = item.trim().split(' ')[0];
                    if (labelField) {
                        child = $($interpolate(TreeviewConfig.nodeTpl)(angular.extend({ repeatExp: item, label: '{{'+labelField+'}}' }, attributes)));
                        parent.append(child);
                        parent = child.find('ol:first');
                    } else {
                        child = $($interpolate(TreeviewConfig.lastNodeTpl)(angular.extend({ repeatExp: item, rowItem: rowItem }, attributes)));
                        parent.append(child);
                        parent = child;
                    }
                });
                parent.append(children);
                parent.addClass('angular-ui-tree-nodes-last');

                return {
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        scope.$watch(
                            function () {
                                var list = iAttrs.jdTreeview.split(';');
                                var firstNode = list[0].split(' ')[2];
                                var listValue = scope.$eval(firstNode);
                                return listValue;
                            },
                            function (newValue, oldValue) {
                                iElement.children().remove("#emptyTreeElement");
                                //If content is null or undefined, doesn't show any content.
                                if (!newValue) {
                                    iElement.hide();
                                } else {
                                    iElement.show();
                                    //If the new list TreeView(newValue) contains an empty array, show alert message.
                                    if (newValue != oldValue && newValue.length === 0) {
                                        var emptyTreeViewTemplate = $interpolate(TreeviewConfig.emptyTpl)(angular.extend({emptyMsgLabel: TreeviewConfig.emptyMsgLabel}, iAttrs));
                                        var emptyTreeViewElement = angular.element(emptyTreeViewTemplate);
                                        iElement.append(emptyTreeViewElement);
                                    }
                                }
                            }
                        );

                        scope.selectedItem = undefined;
                        scope.collapsed = false;

                        scope.changeClass = function (item) {
                            scope.selectedItem = item;
                        };

                        scope.toggle = function ($event) {
                            var elementToToggle = angular.element($event.currentTarget.firstChild);

                            if (elementToToggle.hasClass('fa fa-minus-square')) {
                                elementToToggle.removeClass('fa fa-minus-square');
                                elementToToggle.addClass('fa fa-plus-square');
                            } else {
                                elementToToggle.removeClass('fa fa-plus-square');
                                elementToToggle.addClass('fa fa-minus-square');
                            }
                        };
                    }
                }
            }
        };
    }]);