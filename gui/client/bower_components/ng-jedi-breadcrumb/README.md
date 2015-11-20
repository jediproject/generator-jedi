# ng-jedi-breadcrumb
Breadcrumb component.
###### Written in [AngularJs](https://angularjs.org/)

### Install

* Install the dependency:

   ```shell
   bower install ng-jedi-breadcrumb --save
   ```
* Add breadcrumb.js to your code:

   ```html
   <script src='assets/libs/ng-jedi-breadcrumb/breadcrumb.js'></script>
   ```
   - Note that the base directory used was assets/libs, you should change bower_components to assets/libs or move from bower_components to assets/libs with [Grunt](http://gruntjs.com/).
* Include module dependency:

   ```javascript
   angular.module('yourApp', ['jedi.breadcrumb']);
   ```
======

### How To Use

  1. [Add jdBreadcrumb](#add-jd-breadcrumb-directive-in-your-html)
  1. [Customize the default template](#use-the-templateurl-attribute-to-customize-the-default-template)
  1. [Register your route navigation words](#register-your-route-navigation-words)

#### Add jd-breadcrumb directive in your html

```html
<jd-breadcrumb></jd-breadcrumb>
```

#### Use the templateUrl attribute to customize the default template

```html
<jd-breadcrumb templateUrl="app/common/components/breadcrumb/breadcrumb.html"></jd-breadcrumb>
```
   - The default template is stored in bower_components/ng-jedi-breadcrumb/breadcrumb.html

#### Register your route navigation words
   - On every route change success, this directive updates the variable $rootScope.appContext.breadcrumb, adding to an array with all route navigation words. Theses words should be setted on [angular-route](https://docs.angularjs.org/api/ngRoute) component.

```javascript
$routeProvider
   .when('/yourRoute', {
      breadcrumb: ['System', 'Module', 'Feature'],
      templateUrl: 'yourPage.html',
      controller: 'yourController'
   })));
```

**[Back to top](#ng-jedi-breadcrumb)**