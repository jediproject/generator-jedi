# [ng-jedi-factory](https://github.com/jediproject/ng-jedi-factory)
Factory helper to easily create [AngularJs](https://angularjs.org/) components (controllers, directives, filters...) and ensure that all dependencies are loaded before it, using [RequireJS](http://requirejs.org/). In other words, the factory easily integrates requirejs and angular. The factory should be used on a javascript file to declare same angularjs components types. Each component type has a factory function. See more below.

  1. [Install](#install)
  1. [How To Use](#how-to-use)

### Install

* Install the dependency:

   ```shell
   bower install ng-jedi-factory --save
   ```
* Add factory.js to your code:

   ```html
   <script src='assets/libs/ng-jedi-factory/factory.js'></script>
   ```
   - Note that the base directory used was assets/libs, you should change bower_components to assets/libs or move from bower_components to assets/libs with [Grunt](http://gruntjs.com/).
* Include module dependency:

   ```javascript
   angular.module('yourApp', ['jedi.factory']);
   ```

* Requirements:

   * The factory works with control of script version and loads the correct script based on version mapper. Your app should have a version.json file, where you should write the mapping between original js file and version-named js file. The version.json file is loaded on load factory, using requirejs. The version.json content should be similar to:
   ```json
   {
      "version": "1.0.0",
      "files": {
         "yourScript.js": "yourScript-hashGenOnBuild.js"
      }
   }
   ```

   - version.json
   - [lodash](https://lodash.com/): it's used in internal statements
   - [jedi.dialogs](https://github.com/jediproject/ng-jedi-dialogs): it's used to open the modal (newModal function below)
   - [RequireJS](http://requirejs.org/): it's used to load the module scripts (app.js, env.js, etc).
   - [restangular](https://github.com/mgonto/restangular): it's used to create a restangular factory to the module (newModule function below).
   - [file-saver-saveas-js](https://github.com/eligrey/FileSaver.js): it's used to expose methods to download using restangular factory.

======

### How To Use

  1. [newController](#newcontrollercontrollername-func)
  1. [newService](#newserviceservicename-api-actions-params)
  1. [newModal](#newmodaldirectivename-templateurl-controllername-injection-modaloptions)
  1. [newDirective](#newdirectivename-injects)
  1. [newFilter](#newfiltername-injects)
  1. [newModule](#newmodulemodule-options)
  1. [loadModules](#loadmodulesurlormodules-options)
  1. [getFileVersion](#getfileversionfile)

#### newController(controllerName, func)
   - This function creates a new [controller](https://docs.angularjs.org/guide/controller) in your angular module

   ```javascript
   jd.factory.newController("yourController", [function () {
      // your controller body
	  // we recommend writting the controller using vm pattern
   }]);
   ```
   - If you need to load a script before the controller, you should pass as the first argument an array with the js path, similar to [RequireJS](http://requirejs.org/). e.g.:

   ```javascript
   jd.factory.newController(['yourService.js'], "yourController", [function () {
      // your controller body
     // we recommend writting the controller using vm pattern
   }]);
   ```

**[Back to top](#how-to-use)**

#### newService(serviceName, api, actions, params)
   - This function creates a new [service](https://docs.angularjs.org/guide/services) based in [$resource](https://docs.angularjs.org/api/ngResource/service/$resource)

   ```javascript
   jd.factory.newService("yourService", 'api/myAction/:userId', {'get': {method: 'GET'}}, {itemId:'@id'});
   .
   .
   // using 'yourService' in a controller
   app.controller(['yourService', function (yourService) {
      var item = yourService.get(id);
	  item.post();
   }])
   ```

**[Back to top](#how-to-use)**

#### newModal(directiveName, templateUrl, controllerName, injection, modalOptions)
   * This function creates a new directive and a controller at the same time, to open as a modal. It uses [jedi.dialogs.ModalHelper](https://github.com/jediproject/ng-jedi-dialogs#custom-modal-dialog) to open the modal.
   - directiveName: directive name that will be created
   - templateUrl: url to your html
   - controllerName: controller name that will be created
   - injection: it's an array that represent injections, input params and the controller function. Important: if your controller needs input parametters, you should declare them imediately before the controller function, in an array of strings.
   - modalOptions: modal options, e.g. {size: 'lg'}
   ```javascript
   jd.factory.newModal("yourModalDirective", 'app/view/yourModal.html', 'yourModalCtrl', ['myService', ['param1', 'param2'], function (myService, param1, param2) {
      // your controller body
	  // we recommend writting the controller using the vm pattern
   }], {size: 'lg'});
   ```

   ```html
   <button your-modal-directive></button>
   Or
   <input your-modal-directive="onblur">
   ```
   - The example above will open the page 'app/view/yourModal.html' in a modal using [$modal](http://angular-ui.github.io/bootstrap/#/modal) (an [angular-bootstrap](https://angular-ui.github.io/bootstrap) component)

**[Back to top](#how-to-use)**

#### newDirective(name, injects)
   - This function creates a new [directive](https://docs.angularjs.org/guide/directive) in your angular module

   ```javascript
   jd.factory.newDirective("yourDirective", [function () {
      return {
         restrict: 'A',
         link: function (scope, element, attrs) {
		 ...
         }
      }
   }]);
   ```

**[Back to top](#how-to-use)**

#### newFilter(name, injects)
   - This function creates a new [filter](https://docs.angularjs.org/guide/filter) in your angular module

   ```javascript
   jd.factory.newFilter('haveModuleWithFeatures', [function () {
      return function (values) {
         return ...;
      }
   ]);
   ```

**[Back to top](#how-to-use)**

#### newModule(module, options)
   - This function creates a [module](https://docs.angularjs.org/guide/module) in your angular app

   ```javascript
   jd.factory.newModule('myModule', {
      externalDeps: [/*external scripts needed in this module, ex: jquery, dojo, angular-ngMask, etc...*/
         'assets/libs/externalScript1.js',
         'assets/libs/externalScript2.js'
      ],
      angularModules: [/*angular modules that depends on this module*/
         'ngMask', 'ngResources'
      ],
      internalDeps: [/*internal scripts needed in this module, ex: directives, filters, controllers, etc...*/
         'app/mymodule/directives/my-directives.js'
      ],
      config: [/*angular config block for this module*/
         'ngMaskConfig', function(ngMaskConfig){
            ...
         }
      ],
      run: [/*angular run block for this module*/
         '$rootScope', function($rootScope){
            ...
         }
      ],
      envJsPath: 'app/{module}/env/{module}-env.js', // path to module env settings, if null the load env is ignored
      useRestangular: true/false, // if true it will create a restangular factory for a module named [module]RestService, e.g.: myModuleRestService. It'll be created if environment settings has a apiUrlBase property.
      envSettingsName: 'envSettings' // contains the name of the global environment settings, it's used as complement to envJsPath.
   });
   ```

**[Back to top](#how-to-use)**

#### loadModules(urlOrModules, options)
   * This function loads all modules returned by the response of the called url. It's recomended if your app has modules that are dynamicaly loaded. The first param can be a list of modules.
   * Options:
   - ignoredModules: list of modules to ignore
   - appJsPath: path to app.js module
   - onloadmodule: event dispatch when module is loaded
   - onfinish: event dispatch when all modules are loaded
   ```javascript
   jd.factory.loadModules('myModules.json', {
      ignoredModules: ['common'],
      appJsPath: 'app/{module}/app.js',
      onloadmodule: function (module, moduleEnvSettings) {
         // event called when it finishes loading each module
      },
      onfinish: function (modules) {
         // event called when it finishes loading all modules
      }
   });
   
   Or
   
   jd.factory.loadModules(['myModule1', 'myModule1'], {
      appJsPath: 'app/{module}/app.js',
      onloadmodule: function (module, moduleEnvSettings) {
         // event called when it finishes loading each module
      },
      onfinish: function (modules) {
         // event called when it finishes loading all modules
      }
   });
   
   // myModules.json:
   ['common', 'security', 'billing']
   ```
   - Recommended using [newModule](#newmodulemodule-options) in your app.js

**[Back to top](#how-to-use)**

#### getFileVersion(file)
   * This function translates the original file to the deployed file, using version.json mapping.

**[Back to top](#how-to-use)**
