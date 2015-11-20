# ng-jedi-loading
Loading component for your application.
###### Written in [AngularJs](https://angularjs.org/)

This component install a http interceptor that starts a loading icon and close it after the response. It's a complement to the [angular-loading-bar](https://github.com/chieffancypants/angular-loading-bar) component. The angular-loading-bar run without blocking the page and if necessary you can use ng-jedi-loading to show a loading sign that blocks the page. 
Also it's possible to show a message after responses where the requests submit a json and this requests are not a GET method. See more below.

  1. [Install](#install)
  1. [How To Use](#how-to-use)

### Install

* Install the dependency:

   ```shell
   bower install ng-jedi-loading --save
   ```
* Add loading.css to your code:

   ```html
   <link rel='stylesheet' href='assets/css/loading.css' type='text/css' media='all' />
   ```
* Add loading.js and loading-directives.js to your code:

   ```html
   <script src='assets/libs/ng-jedi-loading/loading.js'></script>
   <script src='assets/libs/ng-jedi-loading/loading-directives.js'></script>
   ```
   - note that the base directory used was assets/libs, you should change bower_components to assets/libs or move from bower_components to assets/libs with [Grunt](http://gruntjs.com/).
* Include module dependency:

   ```javascript
   angular.module('yourApp', ['jedi.loading']);
   ```
======

### How To Use

  1. [Enable info after request](#enable-info-after-request-andor-custom-info-message)
  1. [Enable only loading block](#enable-only-loading-block)
  1. [Ignore loading bar on a request](#ignore-loading-bar-on-a-request)
  1. [Show loading block on a request](#show-loading-block-on-a-request)
  1. [Add jd-loading directive in your html](#add-jd-loading-directive-in-your-html)
  1. [Customize the default template](#use-the-templateurl-attribute-to-customize-the-default-template)

#### Enable info after request and/or custom info message

   ```javascript
   app.config(['jedi.loading.LoadingConfig', function(LoadingConfig){
      LoadingConfig.enableInfoAfterResponse = true; // default is false
      LoadingConfig.infoAfterResponseMessage = "yourMessage";
   }]);
   ```
   - default templates are stored in ng-jedi-dialogs/dialogs-alert.html and ng-jedi-dialogs/dialogs-confirm.html
   
#### Enable only loading block

   ```javascript
   app.config(['jedi.loading.LoadingConfig', function(LoadingConfig){
      LoadingConfig.enableLoadingBar = false; // default is true
      LoadingConfig.enableLoadingBlock = true; // default is false
   }]);
   ```

#### Ignore loading bar on a request

   ```javascript
   $http.get('yourUrl', {ignoreLoadingBar: true});
   ```

#### Show loading block on a request

   ```javascript
   $http.get('yourUrl', {showLoadingModal: true});
   ```

#### Add jd-loading directive in your html

   ```html
   <jd-loading></jd-loading>
   ```

#### Use the templateUrl attribute to customize the default template

   ```html
   <jd-loading templateUrl="app/common/components/loading/loading.html"></jd-loading>
   ```
   - The default template is stored in ng-jedi-loading/loading.html

**[Back to top](#ng-jedi-loading)**