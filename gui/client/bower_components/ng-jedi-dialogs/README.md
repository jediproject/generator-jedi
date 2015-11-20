# ng-jedi-dialogs
Dialogs component for your application.
###### Written in [AngularJs](https://angularjs.org/)

  1. [Install](#install)
  1. [How To Use](#how-to-use)

### Install

* Install the dependency:

   ```shell
      bower install ng-jedi-dialogs --save
   ```
* Add dialogs.js and dialogs-ctrls.js to your code:

   ```html
      <script src='assets/libs/ng-jedi-dialogs/dialogs.js'></script>
      <script src='assets/libs/ng-jedi-dialogs/dialogs-ctrls.js'></script>
   ```
   - Note that the base directory used was assets/libs, you should change bower_components to assets/libs or move from bower_components to assets/libs with [Grunt](http://gruntjs.com/).

* Include module dependency:

   ```javascript
      angular.module('yourApp', ['jedi.dialogs']);
   ```

======

### How To Use

  1. [Configuration](#configuration)
  1. [Confirmation Dialog](#confirmation-dialog)
  1. [Alert Dialog](#alert-dialog)
  1. [Custom Modal Dialog](#custom-modal-dialog)

#### Configuration
   
   - If necessary, to customize the default template, you should change template url in constant object jedi.dialogs.DialogsConfig**

   ```javascript
      app.config(['jedi.dialogs.DialogsConfig', function(DialogsConfig){
         DialogsConfig.templateUrlAlert = "app/common/components/dialogs/dialogs-alert.html";
         DialogsConfig.templateUrlConfirm = "app/common/components/dialogs/dialogs-confirm.html";
      }]);
   ```
   - default templates are stored in ng-jedi-dialogs/dialogs-alert.html and ng-jedi-dialogs/dialogs-confirm.html

**[Back to top](#how-to-use)**

#### Confirmation Dialog

```javascript
      app.controller('yourController', ['jedi.dialogs.AlertHelper', function(AlertHelper){
         .
         .
         AlertHelper.confirm('Your confirmation message', function(){
            // yes event
         }, function(){
            // no event
         });
         .
         .
      }]);
```
   
   **[Back to top](#how-to-use)**

#### Alert Dialog

```javascript
      app.controller('yourController', ['jedi.dialogs.AlertHelper', function(AlertHelper){
         .
         .
         AlertHelper.addInfo('Your info message'); // bootstrap class text-info
         AlertHelper.addError('Your error message'); // bootstrap class text-danger
         AlertHelper.addWarn('Your warn message'); // bootstrap class text-dangerwarning
         .
         .
      }]);
```

   **[Back to top](#how-to-use)**

#### Custom Modal Dialog

```javascript
      app.controller('yourController', ['jedi.dialogs.ModalHelper', function(ModalHelper){
         .
         .
         ModalHelper.open('yourModal.html', 'yourControllerName', { param1: value1, param2: value2 }, function () {
            // success event closing
         }, function () {
            // fail event closing
         }, { size: 'lg' });// last param is the $modal.options
         .
         .
      }]);
```
   - The second param ('yourControllerName') can also be an array injection with the controller function.
   - The third param is an object that represents specified input parameters to open your modal.

**[Back to top](#how-to-use)**